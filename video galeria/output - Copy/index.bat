@echo off
:: Define as pastas de origem e destino
set origem=D:\Herbert\Codes\Learning\learning-documatition\video galeria\output\Source
set destino=D:\Herbert\Codes\Learning\learning-documatition\video galeria\output

:: Cria a pasta de destino, se ela não existir
if not exist "%destino%" (
    mkdir "%destino%"
)

:: Move os arquivos das subpastas para a pasta de destino, sem sobrescrever
for /r "%origem%" %%f in (*) do (
    if not exist "%destino%\%%~nxf" (
        copy "%%f" "%destino%\"
    ) else (
        echo Arquivo já existe: %%~nxf - Ignorado
    )
)

echo Transferência concluída!
pause
