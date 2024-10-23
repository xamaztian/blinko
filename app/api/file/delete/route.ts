import { remultServer } from "@/server/remult";
import { attachmentsRepo } from "@/server/share/index";
import { unlink } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const POST = async (req: Request, res: NextResponse) => {
  return remultServer.withRemult(async () => {
    try {
      return NextResponse.json({ Message: "Success", status: 200 });
    } catch (error) {
      return NextResponse.json({ Message: error?.message ?? "Internal server error", status: 500 });
    }
  });
};