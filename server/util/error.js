export function getErrorMessage(err) {
  let messages = [];
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        messages = ['Unique properti(es) is exist'];
        break;
      default: break;
    }
  } else {
    for (const value of Object.values(err.errors)) {
      if (value.message) messages.push(value.message);
    }
  }
  return `${messages.join('. ')}.`;
}
