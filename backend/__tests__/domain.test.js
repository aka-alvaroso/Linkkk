require('./setup');
const request = require('supertest');
const { app, createTestUser, getCsrfToken, prisma } = require('./helpers');

async function createTestProUser(suffix = '') {
  const { user, token } = await createTestUser(`test_pro${suffix}`, `pro${suffix}@example.com`);
  const upgraded = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'PRO' },
  });
  return { user: upgraded, token };
}

async function authHeaders(token) {
  const { csrfToken, cookies } = await getCsrfToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token': csrfToken,
      Cookie: cookies?.join('; ') || '',
      'Content-Type': 'application/json',
    },
  };
}

afterEach(async () => {
  await prisma.customDomain.deleteMany({});
});

describe('Custom Domains', () => {
  describe('GET /domain', () => {
    it('returns empty list for a new PRO user', async () => {
      const { token } = await createTestProUser('_list');
      const { headers } = await authHeaders(token);

      const res = await request(app).get('/domain').set(headers).expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('rejects unauthenticated requests', async () => {
      await request(app).get('/domain').expect(401);
    });
  });

  describe('POST /domain', () => {
    it('PRO user can add a valid subdomain', async () => {
      const { token } = await createTestProUser('_add');
      const { headers } = await authHeaders(token);

      const res = await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'go.testdomain.com' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.domain).toBe('go.testdomain.com');
      expect(res.body.data.status).toBe('PENDING');
    });

    it('rejects root domains (no subdomain)', async () => {
      const { token } = await createTestProUser('_root');
      const { headers } = await authHeaders(token);

      const res = await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'testdomain.com' })
        .expect(400);

      expect(res.body.code).toBe('DOMAIN_INVALID');
    });

    it('rejects linkkk.dev subdomains', async () => {
      const { token } = await createTestProUser('_linkkk');
      const { headers } = await authHeaders(token);

      const res = await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'go.linkkk.dev' })
        .expect(400);

      expect(res.body.code).toBe('DOMAIN_INVALID');
    });

    it('rejects invalid domain format', async () => {
      const { token } = await createTestProUser('_invalid');
      const { headers } = await authHeaders(token);

      const res = await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'not a domain!' })
        .expect(400);

      expect(res.body.code).toBe('DOMAIN_INVALID');
    });

    it('rejects a domain already registered by another user', async () => {
      const { token: tokenA } = await createTestProUser('_dupA');
      const { token: tokenB } = await createTestProUser('_dupB');
      const { headers: headersA } = await authHeaders(tokenA);
      const { headers: headersB } = await authHeaders(tokenB);

      await request(app)
        .post('/domain')
        .set(headersA)
        .send({ domain: 'go.duplicate.com' })
        .expect(201);

      const res = await request(app)
        .post('/domain')
        .set(headersB)
        .send({ domain: 'go.duplicate.com' })
        .expect(400);

      expect(res.body.code).toBe('DOMAIN_ALREADY_EXISTS');
    });

    it('STANDARD user cannot add a domain', async () => {
      const { token } = await createTestUser('test_standard_dom', 'standard_dom@example.com');
      const { headers } = await authHeaders(token);

      const res = await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'go.testdomain.com' })
        .expect(400);

      expect(res.body.code).toBe('DOMAIN_LIMIT_EXCEEDED');
    });

    it('PRO user cannot exceed the domain limit', async () => {
      const { token } = await createTestProUser('_limit');
      const { headers } = await authHeaders(token);

      await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'go.first.com' })
        .expect(201);

      const res = await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'go.second.com' })
        .expect(400);

      expect(res.body.code).toBe('DOMAIN_LIMIT_EXCEEDED');
    });
  });

  describe('DELETE /domain/:domainId', () => {
    it('PRO user can delete their own domain', async () => {
      const { token } = await createTestProUser('_del');
      const { headers } = await authHeaders(token);

      const created = await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'go.todelete.com' })
        .expect(201);

      const id = created.body.data.id;

      const res = await request(app)
        .delete(`/domain/${id}`)
        .set(headers)
        .expect(200);

      expect(res.body.data.deleted).toBe(true);
    });

    it('cannot delete another user\'s domain', async () => {
      const { token: tokenA } = await createTestProUser('_delA');
      const { token: tokenB } = await createTestProUser('_delB');
      const { headers: headersA } = await authHeaders(tokenA);
      const { headers: headersB } = await authHeaders(tokenB);

      const created = await request(app)
        .post('/domain')
        .set(headersA)
        .send({ domain: 'go.usera.com' })
        .expect(201);

      const id = created.body.data.id;

      const res = await request(app)
        .delete(`/domain/${id}`)
        .set(headersB)
        .expect(403);

      expect(res.body.code).toBe('DOMAIN_ACCESS_DENIED');
    });
  });

  describe('GET /internal/check-domain', () => {
    it('returns 404 for an unknown domain', async () => {
      await request(app)
        .get('/internal/check-domain?domain=go.unknown.com')
        .expect(404);
    });

    it('returns 404 for a PENDING domain (not yet verified)', async () => {
      const { token } = await createTestProUser('_chk');
      const { headers } = await authHeaders(token);

      await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'go.pending.com' })
        .expect(201);

      await request(app)
        .get('/internal/check-domain?domain=go.pending.com')
        .expect(404);
    });

    it('returns 200 for an ACTIVE domain', async () => {
      const { token, user } = await createTestProUser('_chkactive');
      const { headers } = await authHeaders(token);

      const created = await request(app)
        .post('/domain')
        .set(headers)
        .send({ domain: 'go.active.com' })
        .expect(201);

      // Force status to ACTIVE directly in DB (skips real DNS check)
      await prisma.customDomain.update({
        where: { id: created.body.data.id },
        data: { status: 'ACTIVE', verifiedAt: new Date() },
      });

      await request(app)
        .get('/internal/check-domain?domain=go.active.com')
        .expect(200);
    });

    it('returns 400 when domain query param is missing', async () => {
      await request(app)
        .get('/internal/check-domain')
        .expect(400);
    });
  });
});
