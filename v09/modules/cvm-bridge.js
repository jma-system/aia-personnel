/* Adaptateur CVM → file de demandes V07. Ne touche jamais aux fiches. */
window.AIACvmBridge = Object.freeze({
  getDate: () => byId('date').value,
  getFormat: () => format,
  enqueue(items) {
    const next = [...queue, ...items];
    try { localStorage.setItem(QKEY, JSON.stringify(next)); }
    catch { throw new Error('Stockage indisponible : aucun sujet ajouté.'); }
    queue.splice(0, queue.length, ...next);
    queueStatus();
  }
});
