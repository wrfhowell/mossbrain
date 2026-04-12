const botToken = () => process.env.TELEGRAM_BOT_TOKEN!;

export async function getFileUrl(fileId: string): Promise<string> {
  const res = await fetch(
    `https://api.telegram.org/bot${botToken()}/getFile?file_id=${fileId}`
  );
  const data = (await res.json()) as {
    ok: boolean;
    result?: { file_path: string };
  };
  if (!data.ok || !data.result) {
    throw new Error(`Telegram getFile failed for ${fileId}`);
  }
  return `https://api.telegram.org/file/bot${botToken()}/${data.result.file_path}`;
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const url = await getFileUrl(fileId);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download Telegram file: ${res.status}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}
