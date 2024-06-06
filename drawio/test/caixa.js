export const resultJson = {
  nodes: [
    {
      id: 'ta-bem',
      value: 'você ta bem?',
      style: 'rounded=0;whiteSpace=wrap;html=1;',
    },
    {
      id: 'okay-tchau',
      value: 'Okay tchau',
      style: 'whiteSpace=wrap;html=1;rounded=0;',
    },
    {
      id: 'sim',
      value: 'sim',
      style: 'whiteSpace=wrap;html=1;rounded=0;',
    },
  ],
  edges: [
    {
      source: 'ta-bem', // linha.source
      target: 'sim',
    },
    {
      source: 'sim',
      target: 'okay-tchau', // linha.target
    },
  ],
}
