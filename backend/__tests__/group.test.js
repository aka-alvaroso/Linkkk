/**
 * Group CRUD & Link-Membership Tests
 */

require('./setup');
const request = require('supertest');
const { app, createTestUser, createTestLink, prisma } = require('./helpers');

describe('Group API', () => {
  let user1Token, user1, user2Token, user2;

  beforeAll(async () => {
    ({ user: user1, token: user1Token } = await createTestUser('test_grp_user1', 'grpuser1@example.com'));
    ({ user: user2, token: user2Token } = await createTestUser('test_grp_user2', 'grpuser2@example.com'));
  });

  afterEach(async () => {
    await prisma.link.deleteMany({ where: { userId: { in: [user1.id, user2.id] } } });
    await prisma.group.deleteMany({ where: { userId: { in: [user1.id, user2.id] } } });
  });

  // ============================================================
  describe('GET /groups', () => {
    it('should return empty list when no groups', async () => {
      const res = await request(app)
        .get('/groups')
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return only the authenticated user groups', async () => {
      await prisma.group.create({ data: { userId: user1.id, name: 'Work' } });
      await prisma.group.create({ data: { userId: user2.id, name: 'Personal' } });

      const res = await request(app)
        .get('/groups')
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Work');
    });

    it('should include link count', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'Counted' } });
      await createTestLink(user1.id, null, 'https://counted1.com');
      await prisma.link.updateMany({ where: { userId: user1.id }, data: { groupId: group.id } });

      const res = await request(app)
        .get('/groups')
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.data[0]._count.links).toBeGreaterThan(0);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app).get('/groups').expect(401);
    });
  });

  // ============================================================
  describe('GET /groups/:groupId', () => {
    it('should return group with its links', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'Details' } });
      const link = await createTestLink(user1.id, null, 'https://detail-link.com');
      await prisma.link.update({ where: { id: link.id }, data: { groupId: group.id } });

      const res = await request(app)
        .get(`/groups/${group.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.data.name).toBe('Details');
      expect(res.body.data.links).toHaveLength(1);
    });

    it('should deny access to another users group', async () => {
      const group = await prisma.group.create({ data: { userId: user2.id, name: 'Private' } });

      await request(app)
        .get(`/groups/${group.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(403);
    });

    it('should return 404 for nonexistent group', async () => {
      await request(app)
        .get('/groups/999999')
        .set('Cookie', `token=${user1Token}`)
        .expect(404);
    });
  });

  // ============================================================
  describe('POST /groups', () => {
    it('should create a group with name only', async () => {
      const res = await request(app)
        .post('/groups')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'Projects' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Projects');
      expect(res.body.data.userId).toBe(user1.id);
    });

    it('should create a group with all optional fields', async () => {
      const res = await request(app)
        .post('/groups')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'Design', description: 'Design resources', color: '#6C63FF' })
        .expect(201);

      expect(res.body.data.description).toBe('Design resources');
      expect(res.body.data.color).toBe('#6C63FF');
    });

    it('should reject duplicate group name for same user', async () => {
      await prisma.group.create({ data: { userId: user1.id, name: 'Dupe' } });

      const res = await request(app)
        .post('/groups')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'Dupe' })
        .expect(400);

      expect(res.body.code).toBe('GROUP_NAME_EXISTS');
    });

    it('should allow same group name for different users', async () => {
      await prisma.group.create({ data: { userId: user1.id, name: 'Shared' } });

      const res = await request(app)
        .post('/groups')
        .set('Cookie', `token=${user2Token}`)
        .send({ name: 'Shared' })
        .expect(201);

      expect(res.body.data.name).toBe('Shared');
    });

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/groups')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: '' })
        .expect(400);

      expect(res.body.code).toBe('INVALID_DATA');
    });

    it('should reject name over 50 chars', async () => {
      const res = await request(app)
        .post('/groups')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'a'.repeat(51) })
        .expect(400);

      expect(res.body.code).toBe('INVALID_DATA');
    });

    it('should reject invalid color format', async () => {
      const res = await request(app)
        .post('/groups')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'Bad Color', color: 'blue' })
        .expect(400);

      expect(res.body.code).toBe('INVALID_DATA');
    });

    it('should enforce group limit for standard users', async () => {
      for (let i = 0; i < 5; i++) {
        await prisma.group.create({ data: { userId: user1.id, name: `group${i}` } });
      }

      const res = await request(app)
        .post('/groups')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'overflow' })
        .expect(400);

      expect(res.body.code).toBe('GROUP_LIMIT_EXCEEDED');
    });
  });

  // ============================================================
  describe('PUT /groups/:groupId', () => {
    it('should update group name', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'OldName' } });

      const res = await request(app)
        .put(`/groups/${group.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'NewName' })
        .expect(200);

      expect(res.body.data.name).toBe('NewName');
    });

    it('should update group description and color', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'Updatable' } });

      const res = await request(app)
        .put(`/groups/${group.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ description: 'New desc', color: '#AABBCC' })
        .expect(200);

      expect(res.body.data.description).toBe('New desc');
      expect(res.body.data.color).toBe('#AABBCC');
    });

    it('should deny updating another users group', async () => {
      const group = await prisma.group.create({ data: { userId: user2.id, name: 'Protected' } });

      await request(app)
        .put(`/groups/${group.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'Hacked' })
        .expect(403);
    });
  });

  // ============================================================
  describe('DELETE /groups/:groupId', () => {
    it('should delete a group and ungroup its links', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'ToDelete' } });
      const link = await createTestLink(user1.id, null, 'https://ungrouped-link.com');
      await prisma.link.update({ where: { id: link.id }, data: { groupId: group.id } });

      await request(app)
        .delete(`/groups/${group.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      const gone = await prisma.group.findUnique({ where: { id: group.id } });
      expect(gone).toBeNull();

      // Link should still exist but ungrouped
      const unlinked = await prisma.link.findUnique({ where: { id: link.id } });
      expect(unlinked).not.toBeNull();
      expect(unlinked.groupId).toBeNull();
    });

    it('should deny deleting another users group', async () => {
      const group = await prisma.group.create({ data: { userId: user2.id, name: 'Safe' } });

      await request(app)
        .delete(`/groups/${group.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(403);
    });
  });

  // ============================================================
  describe('POST /groups/:groupId/links/:linkId (move link)', () => {
    it('should move a link into a group', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'Inbox' } });
      const link = await createTestLink(user1.id, null, 'https://move-me.com');

      const res = await request(app)
        .post(`/groups/${group.id}/links/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.data.groupId).toBe(group.id);
    });

    it('should deny moving a link to another users group', async () => {
      const group = await prisma.group.create({ data: { userId: user2.id, name: 'Alien' } });
      const link = await createTestLink(user1.id, null, 'https://my-link.com');

      await request(app)
        .post(`/groups/${group.id}/links/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(403);
    });

    it('should deny moving another users link into my group', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'Mine' } });
      const link = await createTestLink(user2.id, null, 'https://their-link.com');

      await request(app)
        .post(`/groups/${group.id}/links/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(403);
    });
  });

  // ============================================================
  describe('DELETE /groups/:groupId/links/:linkId (remove link)', () => {
    it('should remove a link from a group', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'Removable' } });
      const link = await createTestLink(user1.id, null, 'https://remove-from-group.com');
      await prisma.link.update({ where: { id: link.id }, data: { groupId: group.id } });

      const res = await request(app)
        .delete(`/groups/${group.id}/links/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.data.groupId).toBeNull();
    });

    it('should return 404 if link is not in the group', async () => {
      const group = await prisma.group.create({ data: { userId: user1.id, name: 'Wrong' } });
      const link = await createTestLink(user1.id, null, 'https://not-in-group.com');

      await request(app)
        .delete(`/groups/${group.id}/links/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(404);
    });
  });
});
