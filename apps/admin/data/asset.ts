"use server";

import { assertAdmin } from "@/lib/require-admin";

import { AssetType } from "@/app/(DASHBOARD)/assets/list/AssetsList";
import { database } from "@igraph/database";

export async function getAssetByUrl(url: string) {
  await assertAdmin();
  return await database.asset.findUnique({
    where: { url },
  });
}

export async function getAssetById(
  id: string | number,
): Promise<AssetType | null> {
  await assertAdmin();
  return await database.asset.findUnique({
    where: { id: +id },
    include: {
      image: true,
    },
  });
}
