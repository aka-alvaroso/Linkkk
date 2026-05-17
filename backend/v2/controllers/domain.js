const dns = require("dns").promises;
const prisma = require("../prisma/client");
const { successResponse, errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const { getLimitsForUser } = require("../utils/limits");

const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const getDomains = async (req, res) => {
  const domains = await prisma.customDomain.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, domains);
};

const addDomain = async (req, res) => {
  const { domain } = req.body;

  if (!domain || !DOMAIN_REGEX.test(domain)) {
    return errorResponse(res, ERRORS.DOMAIN_INVALID);
  }

  const normalized = domain.toLowerCase().trim();

  // Must be a subdomain (at least 3 parts: sub.domain.tld)
  if (normalized.split(".").length < 3) {
    return errorResponse(res, ERRORS.DOMAIN_INVALID);
  }

  // Block adding linkkk.dev subdomains
  if (normalized === "linkkk.dev" || normalized.endsWith(".linkkk.dev")) {
    return errorResponse(res, ERRORS.DOMAIN_INVALID);
  }

  const limits = getLimitsForUser(req.user, null);
  if (limits.customDomains === 0) {
    return errorResponse(res, ERRORS.DOMAIN_LIMIT_EXCEEDED);
  }

  const count = await prisma.customDomain.count({ where: { userId: req.user.id } });
  if (limits.customDomains !== null && count >= limits.customDomains) {
    return errorResponse(res, ERRORS.DOMAIN_LIMIT_EXCEEDED);
  }

  try {
    const created = await prisma.customDomain.create({
      data: { userId: req.user.id, domain: normalized },
    });
    return successResponse(res, created, 201);
  } catch (error) {
    if (error.code === "P2002") {
      return errorResponse(res, ERRORS.DOMAIN_ALREADY_EXISTS);
    }
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};

const verifyDomain = async (req, res) => {
  const domainId = parseInt(req.params.domainId, 10);
  if (isNaN(domainId)) return errorResponse(res, ERRORS.DOMAIN_NOT_FOUND);

  const record = await prisma.customDomain.findUnique({ where: { id: domainId } });
  if (!record) return errorResponse(res, ERRORS.DOMAIN_NOT_FOUND);
  if (record.userId !== req.user.id) return errorResponse(res, ERRORS.DOMAIN_ACCESS_DENIED);

  await prisma.customDomain.update({
    where: { id: domainId },
    data: { status: "VERIFYING", errorMsg: null },
  });

  // DNS lookup: the domain's CNAME must resolve to linkkk.dev
  try {
    const cnames = await dns.resolveCname(record.domain);
    const pointsToLinkkk = cnames.some(
      (c) => c === "linkkk.dev" || c.endsWith(".linkkk.dev")
    );

    if (!pointsToLinkkk) {
      await prisma.customDomain.update({
        where: { id: domainId },
        data: {
          status: "ERROR",
          errorMsg: `CNAME resolves to [${cnames.join(", ")}] instead of linkkk.dev`,
        },
      });
      return errorResponse(res, ERRORS.DOMAIN_DNS_FAILED);
    }

    const updated = await prisma.customDomain.update({
      where: { id: domainId },
      data: { status: "ACTIVE", verifiedAt: new Date(), errorMsg: null },
    });
    return successResponse(res, updated);
  } catch {
    await prisma.customDomain.update({
      where: { id: domainId },
      data: { status: "ERROR", errorMsg: "CNAME record not found" },
    });
    return errorResponse(res, ERRORS.DOMAIN_DNS_FAILED);
  }
};

const deleteDomain = async (req, res) => {
  const domainId = parseInt(req.params.domainId, 10);
  if (isNaN(domainId)) return errorResponse(res, ERRORS.DOMAIN_NOT_FOUND);

  const record = await prisma.customDomain.findUnique({ where: { id: domainId } });
  if (!record) return errorResponse(res, ERRORS.DOMAIN_NOT_FOUND);
  if (record.userId !== req.user.id) return errorResponse(res, ERRORS.DOMAIN_ACCESS_DENIED);

  await prisma.customDomain.delete({ where: { id: domainId } });
  return successResponse(res, { deleted: true });
};

// Internal endpoint consumed by Caddy on-demand TLS — not exposed to users
const checkDomainForCaddy = async (req, res) => {
  const domain = req.query.domain;
  if (!domain) return res.sendStatus(400);

  const record = await prisma.customDomain.findFirst({
    where: { domain: domain.toLowerCase(), status: "ACTIVE" },
  });

  return res.sendStatus(record ? 200 : 404);
};

module.exports = { getDomains, addDomain, verifyDomain, deleteDomain, checkDomainForCaddy };
