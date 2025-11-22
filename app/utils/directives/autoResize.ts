export default function autoResize(event: Event, height: number) {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = height + 'px'; // Reset height
  if (textarea.scrollHeight > height) {
    textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
  } else {
    textarea.style.height = height + 'px';
  }
}
