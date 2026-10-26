async function loadNotes() {
  const notes = await window.notesApi.getAll();
  const container = document.getElementById('notes');
  container.innerHTML = notes.map(n => `<div class="note"><h3>${n.title}</h3><p>${n.content}</p></div>`).join('');
}

document.addEventListener('DOMContentLoaded', loadNotes);
