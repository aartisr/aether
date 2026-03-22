import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;
  return NextResponse.json({ message: `Hello ${slug}!` });
}
