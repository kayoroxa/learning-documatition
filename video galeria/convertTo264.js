const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// 👇 Defina seus arquivos e pasta aqui
const videos = {
  folder: "D:/Herbert/VIDEO CRAFT/Assets - DB/Videos/Filmes & youtube/Series/Arcane (2021) Season 1 S01 (1080p NF WEB-DL x265 HEVC 10bit EAC3 5.1 t3nzin)", // Caminho absoluto ou relativo
  files: ["Arcane (2021) - S01E03 - The Base Violence Necessary for Change (1080p NF WEB-DL x265 t3nzin).mkv", "Arcane (2021) - S01E05 - Everybody Wants to Be My Enemy (1080p NF WEB-DL x265 t3nzin).mkv"]
};

// Verifica se pasta existe
if (!fs.existsSync(videos.folder)) {
  console.error("❌ Pasta não encontrada:", videos.folder);
  process.exit(1);
}

videos.files.forEach((fileName) => {
  const inputPath = path.join(videos.folder, fileName);
  const { name } = path.parse(fileName);
  const outputPath = path.join(videos.folder, `${name}.mp4`);

  // Verifica se o arquivo existe
  if (!fs.existsSync(inputPath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${inputPath}`);
    return;
  }

  const command = `ffmpeg -i "${inputPath}" -c:v libx264 -preset fast -crf 23 -c:a copy "${outputPath}"`;

  console.log(`🔄 Convertendo: ${fileName} ➜ ${name}.mp4`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Erro ao converter ${fileName}:`, error.message);
      return;
    }
    console.log(`✅ Conversão de ${fileName} concluída!`);
  });
});
