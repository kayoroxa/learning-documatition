const PREVIEW_OPTS = {
  ENABLE_LOWRES: true,              // on/off reencode forçado de resolução 320x240
  SCALE        : '320:-2',
  FPS          : '15',
  PRESET       : 'ultrafast',
  CRF          : '30',
}

const CUT_OPTS = {
  COPY_WHEN_COMPATIBLE : true,  // -c copy se codec de vídeo for compatível deixe sempre true por vias das dúvidas
  HQ_PRESET            : 'veryfast',
  HQ_CRF               : '18',
  ALLOW_PREVIEW_AS_SRC : false, // -copy se preview já existe
  PRECISE_CUT          : false,      // Usar o argumento -ss exato antes do -i
}

module.exports = { PREVIEW_OPTS, CUT_OPTS }
