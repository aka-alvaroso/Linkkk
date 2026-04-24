/**
 * Tag CRUD & Assignment Tests
 */

require('./setup');
const request = require('supertest');
const { app, createTestUser, createTestLink, prisma } = require('./helpers');

describe('Tag API', () => {
  let user1Token, user1, user2Token, user2;

  beforeAll(async () => {
    ({ user: user1, token: user1Token } = await createTestUser('test_tag_user1', 'taguser1@example.com'));
    ({ user: user2, token: user2Token } = await createTestUser('test_tag_user2', 'taguser2@example.com'));
  });

  afterEach(async () => {
    await prisma.linkTag.deleteMany({});
    await prisma.tag.deleteMany({ where: { userId: { in: [user1.id, user2.id] } } });
    await prisma.link.deleteMany({ where: { userId: { in: [user1.id, user2.id] } } });
  });

  // ============================================================
  describe('GET /tags', () => {
    it('should return empty list when no tags', async () => {
      const res = await request(app)
        .get('/tags')
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return only the authenticated user tags', async () => {
      await prisma.tag.create({ data: { userId: user1.id, name: 'work' } });
      await prisma.tag.create({ data: { userId: user2.id, name: 'personal' } });

      const res = await request(app)
        .get('/tags')
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('work');
    });

    it('should reject unauthenticated requests', async () => {
      await request(app).get('/tags').expect(401);
    });
  });

  // ============================================================
  describe('POST /tags', () => {
    it('should create a tag with name only', async () => {
      const res = await request(app)
        .post('/tags')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'work' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('work');
      expect(res.body.data.userId).toBe(user1.id);
    });

    it('should create a tag with name and color', async () => {
      const res = await request(app)
        .post('/tags')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'important', color: '#FF5733' })
        .expect(201);

      expect(res.body.data.color).toBe('#FF5733');
    });

    it('should reject invalid color format', async () => {
      const res = await request(app)
        .post('/tags')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'bad', color: 'red' })
        .expect(400);

      expect(res.body.code).toBe('INVALID_DATA');
    });

    it('should reject duplicate tag name for same user', async () => {
      await prisma.tag.create({ data: { userId: user1.id, name: 'work' } });

      const res = await request(app)
        .post('/tags')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'work' })
        .expect(400);

      expect(res.body.code).toBe('TAG_NAME_EXISTS');
    });

    it('should allow same tag name for different users', async () => {
      await prisma.tag.create({ data: { userId: user1.id, name: 'work' } });

      const res = await request(app)
        .post('/tags')
        .set('Cookie', `token=${user2Token}`)
        .send({ name: 'work' })
        .expect(201);

      expect(res.body.data.name).toBe('work');
    });

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/tags')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: '' })
        .expect(400);

      expect(res.body.code).toBe('INVALID_DATA');
    });

    it('should reject name over 30 chars', async () => {
      const res = await request(app)
        .post('/tags')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'a'.repeat(31) })
        .expect(400);

      expect(res.body.code).toBe('INVALID_DATA');
    });

    it('should enforce tag limit for standard users', async () => {
      // Standard users have 20 tags limit
      for (let i = 0; i < 20; i++) {
        await prisma.tag.create({ data: { userId: user1.id, name: `tag${i}` } });
      }

      const res = await request(app)
        .post('/tags')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'overflow' })
        .expect(400);

      expect(res.body.code).toBe('TAG_LIMIT_EXCEEDED');
    });
  });

  // ============================================================
  describe('PUT /tags/:tagId', () => {
    it('should update tag name', async () => {
      const tag = await prisma.tag.create({ data: { userId: user1.id, name: 'old' } });

      const res = await request(app)
        .put(`/tags/${tag.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'new' })
        .expect(200);

      expect(res.body.data.name).toBe('new');
    });

    it('should update tag color', async () => {
      const tag = await prisma.tag.create({ data: { userId: user1.id, name: 'colored' } });

      const res = await request(app)
        .put(`/tags/${tag.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ color: '#123456' })
        .expect(200);

      expect(res.body.data.color).toBe('#123456');
    });

    it('should deny access to another users tag', async () => {
      const tag = await prisma.tag.create({ data: { userId: user2.id, name: 'private' } });

      const res = await request(app)
        .put(`/tags/${tag.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'hacked' })
        .expect(403);

      expect(res.body.code).toBe('TAG_ACCESS_DENIED');
    });

    it('should return 404 for nonexistent tag', async () => {
      await request(app)
        .put('/tags/999999')
        .set('Cookie', `token=${user1Token}`)
        .send({ name: 'x' })
        .expect(404);
    });
  });

  // ============================================================
  describe('DELETE /tags/:tagId', () => {
    it('should delete a tag', async () => {
      const tag = await prisma.tag.create({ data: { userId: user1.id, name: 'to-delete' } });

      const res = await request(app)
        .delete(`/tags/${tag.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(200);

      expect(res.body.data.deleted).toBe(true);

      const gone = await prisma.tag.findUnique({ where: { id: tag.id } });
      expect(gone).toBeNull();
    });

    it('should deny deleting another users tag', async () => {
      const tag = await prisma.tag.create({ data: { userId: user2.id, name: 'safe' } });

      await request(app)
        .delete(`/tags/${tag.id}`)
        .set('Cookie', `token=${user1Token}`)
        .expect(403);
    });
  });

  // ============================================================
  describe('PUT /tags/link/:linkId (assign tags to link)', () => {
    it('should assign tags to a link', async () => {
      const link = await createTestLink(user1.id, null, 'https://assign-test.com');
      const tag1 = await prisma.tag.create({ data: { userId: user1.id, name: 'news' } });
      const tag2 = await prisma.tag.create({ data: { userId: user1.id, name: 'tech' } });

      const res = await request(app)
        .put(`/tags/link/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ tagIds: [tag1.id, tag2.id] })
        .expect(200);

      expect(res.body.data.tags).toHaveLength(2);
    });

    it('should replace existing tags when reassigning', async () => {
      const link = await createTestLink(user1.id, null, 'https://replace-test.com');
      const tag1 = await prisma.tag.create({ data: { userId: user1.id, name: 'first' } });
      const tag2 = await prisma.tag.create({ data: { userId: user1.id, name: 'second' } });

      await prisma.linkTag.create({ data: { linkId: link.id, tagId: tag1.id } });

      const res = await request(app)
        .put(`/tags/link/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ tagIds: [tag2.id] })
        .expect(200);

      expect(res.body.data.tags).toHaveLength(1);
      expect(res.body.data.tags[0].tag.name).toBe('second');
    });

    it('should allow clearing all tags by passing empty array', async () => {
      const link = await createTestLink(user1.id, null, 'https://clear-test.com');
      const tag = await prisma.tag.create({ data: { userId: user1.id, name: 'clear-me' } });
      await prisma.linkTag.create({ data: { linkId: link.id, tagId: tag.id } });

      const res = await request(app)
        .put(`/tags/link/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ tagIds: [] })
        .expect(200);

      expect(res.body.data.tags).toHaveLength(0);
    });

    it('should deny assigning tags from another user', async () => {
      const link = await createTestLink(user1.id, null, 'https://xss-test.com');
      const foreignTag = await prisma.tag.create({ data: { userId: user2.id, name: 'foreign' } });

      const res = await request(app)
        .put(`/tags/link/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ tagIds: [foreignTag.id] })
        .expect(404);

      expect(res.body.code).toBe('TAG_NOT_FOUND');
    });

    it('should deny assigning tags to another users link', async () => {
      const link = await createTestLink(user2.id, null, 'https://other-link.com');
      const tag = await prisma.tag.create({ data: { userId: user1.id, name: 'mytag' } });

      await request(app)
        .put(`/tags/link/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ tagIds: [tag.id] })
        .expect(403);
    });

    it('should enforce tagsPerLink limit', async () => {
      const link = await createTestLink(user1.id, null, 'https://perlimit-test.com');
      const tags = [];
      for (let i = 0; i < 6; i++) {
        const t = await prisma.tag.create({ data: { userId: user1.id, name: `limit-tag-${i}` } });
        tags.push(t.id);
      }

      const res = await request(app)
        .put(`/tags/link/${link.id}`)
        .set('Cookie', `token=${user1Token}`)
        .send({ tagIds: tags })
        .expect(400);

      expect(res.body.code).toBe('TAGS_PER_LINK_EXCEEDED');
    });
  });
});
