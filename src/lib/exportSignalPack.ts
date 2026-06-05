import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import JSZip from "jszip";
import { Platform } from "react-native";

import { buildSignalPackFiles } from "@/lib/signalPack";
import type { Asset } from "@/types";

/**
 * Build the signal-pack file set, zip it, and hand it to the OS share sheet.
 * Returns the ids of the flight-ready assets that were packaged, so the caller
 * can flip them to `exported` after a successful share (Docs/07).
 */
export async function exportSignalPack(
  assets: Asset[],
  launchDate: number | undefined,
  appName = "Launch",
): Promise<string[]> {
  const files = buildSignalPackFiles(assets, launchDate);
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.content);
  const base64 = await zip.generateAsync({ type: "base64" });

  const fileName = `${appName.replace(/[^a-z0-9]+/gi, "-")}-signal-pack.zip`;

  if (Platform.OS === "web") {
    const link = document.createElement("a");
    link.href = `data:application/zip;base64,${base64}`;
    link.download = fileName;
    link.click();
  } else {
    const uri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/zip",
        dialogTitle: "Signal Pack",
        UTI: "public.zip-archive",
      });
    }
  }

  return assets.filter((a) => a.status === "flight_ready").map((a) => a.id);
}
