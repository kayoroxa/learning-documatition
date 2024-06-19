import os
import subprocess

# Lista de links do YouTube
youtube_links = """
https://www.youtube.com/watch?v=t7wDnAoirTc&pp=ygUhQmVjb21pbmcgRGlzY2lwbGluZWQgaXMgTk9UIGVhc3ku
https://www.youtube.com/watch?v=O7UKSMYoWns&pp=ygUhQmVjb21pbGluZWQgaXMgTk9UIGVhc3ku
https://www.youtube.com/watch?v=rzW0wOkBmVM&pp=ygUhQmVjb21pbGluZWQgaXMgTk9UIGVhc3ku
https://www.youtube.com/watch?v=90GJYsRDnmI&pp=ygUhQmVjb21pbGluZWQgaXMgTk9UIGVhc3ku
https://www.youtube.com/watch?v=IXZFHYS1eV4&pp=ygUhQmVjb21pbGluZWQgaXMgTk9UIGVhc3ku
https://www.youtube.com/watch?v=02o-gxQy130&pp=ygUhQmVjb21pbGluZWQgaXMgTk9UIGVhc3ku
https://www.youtube.com/watch?v=3kKB6wYqP7Y&pp=ygUhQmVjb21pbGluZWQgaXMgTk9UIGVhc3ku
https://www.youtube.com/watch?v=m69pLYwVmDg&pp=ygUhQmVjb21pbGluZWQgaXMgTk9UIGVhc3ku
""".strip().split("\n")

# Diretório onde as legendas serão salvas
save_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "subtitles")

# Cria o diretório se não existir
if not os.path.exists(save_dir):
    os.makedirs(save_dir)

# Função para baixar a legenda em formato SRT
def download_subtitle(link):
    command = [
        'yt-dlp',
        '--write-auto-sub',        # Baixa as legendas automáticas
        '--convert-subs', 'srt',   # Converte as legendas para SRT
        '--skip-download',         # Não baixa o vídeo
        '--output', os.path.join(save_dir, '%(id)s__%(title)s.%(ext)s'),
        link
    ]
    
    result = subprocess.run(command, capture_output=True, text=True)
    print(f"Downloading subtitle for {link}")
    print(result.stdout)
    if result.stderr:
        print(f"Error: {result.stderr}")

# Baixa as legendas para todos os links
for link in youtube_links:
    download_subtitle(link)

print("Download de legendas concluído!")
