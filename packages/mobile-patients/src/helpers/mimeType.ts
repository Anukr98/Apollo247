const types = [
  {
    extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
    mime: 'text/plain',
  },
  {
    extensions: ['pdf'],
    mime: 'application/pdf',
  },
  {
    extensions: ['jpeg', 'jpg', 'jpe'],
    mime: 'image/jpeg',
  },
  {
    extensions: ['png'],
    mime: 'image/png',
  },
  {
    extensions: ['zip'],
    mime: 'application/zip',
  },
];

const extname = function(path: string) {
  if (!path || path.indexOf('.') === -1) {
    return '';
  } else {
    return path
      .split('.')
      .pop()!
      .toLowerCase();
  }
};

export const mimeType = (file: string) => {
  let t = types.find((item) => item.extensions.includes(extname(file)));
  return (t && t.mime) || '*/*';
};
