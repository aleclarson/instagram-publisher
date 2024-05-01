export function validateCookies(cookies: any[]): Boolean {
  const expirationDate = new Date(
    cookies.find((c: any) => c.key === 'sessionid').expires
  );
  return new Date() < expirationDate;
}

export async function sleep(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
