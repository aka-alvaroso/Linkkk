require('./setup');
const { createGuestSession } = require('./helpers');

describe('Debug Guest Session', () => {
  it('should show guest session structure', async () => {
    const result = await createGuestSession();
    console.log('=== GUEST SESSION RESULT ===');
    console.log('Full result:', JSON.stringify(result, null, 2));
    console.log('guestSession:', result.guestSession);
    console.log('guestSession.id:', result.guestSession?.id);
    console.log('cookies:', result.cookies);
  });
});
