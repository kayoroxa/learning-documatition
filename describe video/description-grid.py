import os

import cv2
import numpy as np
import torch
from transformers import pipeline

# Verifica se a GPU está disponível e inicializa a pipeline com a GPU, se disponível
device = 0 if torch.cuda.is_available() else -1
pipe = pipeline("image-to-text", model="Salesforce/blip-image-captioning-large", device=device)

# Função para extrair múltiplos frames do vídeo
def extract_frames(video_path, num_frames):
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_interval = total_frames // num_frames
    frames = []

    for i in range(num_frames):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i * frame_interval)
        ret, frame = cap.read()
        if ret:
            frames.append(frame)
        else:
            break

    cap.release()
    return frames

# Função para criar um grid de frames
def create_frame_grid(frames, grid_size=(2, 2)):
    rows, cols = grid_size
    h, w, _ = frames[0].shape
    grid_img = np.zeros((rows * h, cols * w, 3), dtype=np.uint8)

    for i, frame in enumerate(frames):
        r = i // cols
        c = i % cols
        grid_img[r * h:(r + 1) * h, c * w:(c + 1) * w, :] = frame

    return grid_img

# Função para descrever e renomear vídeos em uma pasta
def describe_and_rename_videos_in_folder(folder_path, num_frames):
    for filename in os.listdir(folder_path):
        if filename.endswith(".mp4") or filename.endswith(".avi") or filename.endswith(".mkv"):
            # Verificar se o arquivo já foi renomeado
            if filename.count('_') > 1:
                print(f"🟡 Ignorado (já renomeado): {filename}")
                continue

            video_path = os.path.join(folder_path, filename)
            frames = extract_frames(video_path, num_frames)
            if frames:
                # Calcular o tamanho do grid
                grid_size = (int(np.sqrt(num_frames)), int(np.sqrt(num_frames)))
                if grid_size[0] * grid_size[1] < num_frames:
                    grid_size = (grid_size[0], grid_size[1] + 1)
                
                # Criar o grid de frames
                grid_img = create_frame_grid(frames, grid_size)

                # Salvar o grid como imagem temporária
                temp_image_path = "temp_frame.jpg"
                cv2.imwrite(temp_image_path, grid_img)
                
                # Descrever a imagem
                description = pipe(temp_image_path)[0]["generated_text"]
                
                # Remover a imagem temporária
                os.remove(temp_image_path)
                
                # Formatar a descrição para ser usada no nome do arquivo
                sanitized_description = "".join([c if c.isalnum() or c.isspace() else "_" for c in description])
                sanitized_description = sanitized_description.replace(" ", "_")
                new_filename = f"{sanitized_description}.mp4"
                old_file_path = os.path.join(folder_path, filename)
                new_file_path = os.path.join(folder_path, new_filename)

                # Verificar se o novo nome do arquivo já existe
                if not os.path.exists(new_file_path):
                    os.rename(old_file_path, new_file_path)
                    print(f"🟢 Renomeado: {filename} -> {new_filename}")
                else:
                    print(f"🔴 Erro: {new_file_path} já existe. Não foi possível renomear {filename}.")

# Caminho da pasta contendo os vídeos
folder_path = "E:/series/Wonder Woman (2017) 720p BrRip x264 - VPPV/output/Wonder.Woman.2017.720p.BluRay.x264.VPPV"
# Número de frames para o grid
num_frames = 4
describe_and_rename_videos_in_folder(folder_path, num_frames)
