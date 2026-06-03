import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

/**
 * Render an HTML string to PDF and let the user save/share it.
 * Native: print to a temp file, then open the OS share sheet.
 * Web: open the browser print dialog (user picks "Save as PDF").
 * Throws on failure; the caller is responsible for user-facing errors.
 */
export async function exportHtmlAsPdf(
  html: string,
  fileName: string,
): Promise<void> {
  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: fileName,
      UTI: "com.adobe.pdf",
    });
  }
}
