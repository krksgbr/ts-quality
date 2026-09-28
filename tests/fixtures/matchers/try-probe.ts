try { work(); } catch (error) { recover(error); }
try { work(); } finally { cleanup(); }
try { work(); } catch { recover(); }
