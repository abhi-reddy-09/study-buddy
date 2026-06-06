/**
 * Request/response contract helpers for integration tests.
 * Use toMatchObject or these helpers so API shape changes break tests.
 */

export function expectUserShape(obj: unknown): void {
  expect(obj).toMatchObject({
    id: expect.any(String),
    email: expect.any(String),
    profile: expect.any(Object),
  });
}

export function expectLoginResponseShape(body: unknown): void {
  expect(body).toMatchObject({
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
    expiresIn: expect.any(String),
    user: expect.any(Object),
  });
  expectUserShape((body as { user: unknown }).user);
}

export function expectRegisterResponseShape(body: unknown): void {
  expect(body).toMatchObject({
    user: expect.any(Object),
  });
  expectUserShape((body as { user: unknown }).user);
}

export function expectAuthMeResponseShape(body: unknown): void {
  expect(body).toMatchObject({
    user: expect.any(Object),
  });
  expectUserShape((body as { user: unknown }).user);
}

export function expectMatchItemShape(obj: unknown): void {
  expect(obj).toMatchObject({
    id: expect.any(String),
    initiatorId: expect.any(String),
    receiverId: expect.any(String),
    status: expect.any(String),
  });
}

export function expectErrorShape(body: unknown): void {
  expect(body).toMatchObject({
    error: expect.any(String),
  });
}
