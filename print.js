// Funcionalidade de impressão para o Oráculo da Floresta
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que todos os elementos estão carregados
    setTimeout(() => {
        const printBtn = document.getElementById('print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                // Dar feedback visual
                const originalText = this.textContent;
                this.textContent = '🖨️ Preparando...';
                this.disabled = true;
                
                // Aguardar um pouco para o browser preparar o layout
                setTimeout(() => {
                    try {
                        window.print();
                    } catch (error) {
                        console.error('Erro na impressão:', error);
                        alert('Erro ao tentar imprimir. Tenta usar Ctrl+P manualmente.');
                    } finally {
                        // Restaurar botão
                        this.textContent = originalText;
                        this.disabled = false;
                    }
                }, 100);
            });
        }
    }, 500);
});