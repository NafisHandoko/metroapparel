import { cookies } from "next/headers";

const CART_COOKIE = "metro_medusa_cart_id";

export async function getCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

export async function setCartId(id: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function removeCartId(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}
