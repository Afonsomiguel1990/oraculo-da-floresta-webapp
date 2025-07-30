// Configuração
const SUPABASE_URL = 'https://bnaklbyemcijyabcfjhx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuYWtsYnllbWNpanlhYmNmamh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjAwODksImV4cCI6MjA2OTQzNjA4OX0.MOds9hnUVD87Gm-J-gIGWWcRDj6p2X0AKRpaZ2Yqx0Q';

// Estados da aplicação
const STATES = {
    LOADING: 'loading',
    CODE_INPUT: 'code-input', 
    PROPHECY: 'prophecy',
    ERROR: 'error'
};

class ProphcyWebApp {
    constructor() {
        this.currentState = STATES.LOADING;
        this.currentProphecy = null;
        
        this.initEventListeners();
        this.checkURL();
        
        console.log('Webapp inicializada');
    }
    
    // Verificar URL para session_id ou mostrar input de código
    checkURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('s');
        const prophecyId = urlParams.get('id');
        
        if (sessionId) {
            this.loadProphecyBySession(sessionId);
        } else if (prophecyId) {
            this.loadProphecyById(prophecyId);
        } else {
            this.setState(STATES.CODE_INPUT);
        }
    }
    
    // Carregar profecia por session_id
    async loadProphecyBySession(sessionId) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/prophecies?session_id=eq.${sessionId}&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Profecia não encontrada');
            }
            
            const prophecies = await response.json();
            
            if (prophecies.length === 0) {
                throw new Error('Profecia não encontrada');
            }
            
            this.displayProphecy(prophecies[0]);
            
        } catch (error) {
            console.error('Erro ao carregar profecia:', error);
            this.showError('Não conseguimos encontrar a tua profecia.');
        }
    }
    
    // Carregar profecia por ID direto
    async loadProphecyById(prophecyId) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/prophecies?id=eq.${prophecyId}&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Profecia não encontrada');
            }
            
            const prophecies = await response.json();
            
            if (prophecies.length === 0) {
                throw new Error('Profecia não encontrada');
            }
            
            this.displayProphecy(prophecies[0]);
            
        } catch (error) {
            console.error('Erro ao carregar profecia:', error);
            this.showError('Não conseguimos encontrar a tua profecia.');
        }
    }
    
    // Carregar profecia por código curto
    async loadProphecyByCode(shortCode) {
        this.setState(STATES.LOADING);
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/prophecies?short_code=eq.${shortCode.toUpperCase()}&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Profecia não encontrada');
            }
            
            const prophecies = await response.json();
            
            if (prophecies.length === 0) {
                throw new Error('Código não encontrado');
            }
            
            this.displayProphecy(prophecies[0]);
            
        } catch (error) {
            console.error('Erro ao carregar profecia:', error);
            this.showError(`Código "${shortCode}" não encontrado. Verifica se está correto.`);
        }
    }
    
    // Mostrar profecia na interface
    displayProphecy(prophecy) {
        this.currentProphecy = prophecy;
        
        // Atualizar elementos da interface
        document.getElementById('archetype-name').textContent = `Arquétipo: ${prophecy.archetype}`;
        document.getElementById('prophecy-text-content').textContent = prophecy.text;
        document.getElementById('prophecy-code-display').textContent = prophecy.short_code;
        
        // Carregar imagem da profecia
        const img = document.getElementById('prophecy-image');
        if (prophecy.story_image_url) {
            img.src = prophecy.story_image_url;
            img.onload = () => {
                this.setState(STATES.PROPHECY);
            };
            img.onerror = () => {
                console.error('Erro ao carregar imagem');
                this.setState(STATES.PROPHECY); // Mostrar mesmo sem imagem
            };
        } else {
            // Se não tiver imagem, gerar uma agora
            this.generateProphecyImage(prophecy.id);
        }
        
        // Atualizar meta tags para partilha
        this.updateMetaTags(prophecy);
    }
    
    // Gerar imagem da profecia (chamar render-story)
    async generateProphecyImage(prophecyId) {
        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/render-story`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ prophecy_id: prophecyId })
            });
            
            if (!response.ok) {
                throw new Error('Erro ao gerar imagem');
            }
            
            const result = await response.json();
            
            // Atualizar imagem
            const img = document.getElementById('prophecy-image');
            img.src = result.image_url;
            
            this.setState(STATES.PROPHECY);
            
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            this.setState(STATES.PROPHECY); // Mostrar mesmo sem imagem
        }
    }
    
    // Atualizar meta tags para partilha
    updateMetaTags(prophecy) {
        // Atualizar título
        document.title = `${prophecy.archetype} - Oráculo da Floresta`;
        
        // Atualizar meta tags Open Graph
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        
        if (ogTitle) ogTitle.content = `A Minha Profecia: ${prophecy.archetype}`;
        if (ogDescription) ogDescription.content = prophecy.text;
        if (ogImage && prophecy.story_image_url) ogImage.content = prophecy.story_image_url;
    }
    
    // Mudar estado da interface
    setState(newState) {
        if (this.currentState === newState) return;
        
        console.log(`Mudando estado: ${this.currentState} -> ${newState}`);
        
        // Esconder estado atual
        const currentStateElement = document.getElementById(`${this.currentState}-state`);
        if (currentStateElement) {
            currentStateElement.classList.remove('active');
        }
        
        // Mostrar novo estado
        const newStateElement = document.getElementById(`${newState}-state`);
        if (newStateElement) {
            newStateElement.classList.add('active');
        }
        
        this.currentState = newState;
    }
    
    // Mostrar erro
    showError(message) {
        document.getElementById('error-message').textContent = message;
        this.setState(STATES.ERROR);
    }
    
    // Download da imagem
    async downloadImage() {
        if (!this.currentProphecy || !this.currentProphecy.story_image_url) {
            alert('Imagem não disponível para download');
            return;
        }
        
        try {
            // Criar link de download
            const link = document.createElement('a');
            link.href = this.currentProphecy.story_image_url;
            link.download = `profecia-${this.currentProphecy.short_code}.svg`;
            link.target = '_blank';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Erro no download:', error);
            
            // Fallback: abrir em nova tab
            window.open(this.currentProphecy.story_image_url, '_blank');
        }
    }
    
    // Partilhar profecia
    async shareProphecy() {
        if (!this.currentProphecy) return;
        
        const shareData = {
            title: `A Minha Profecia: ${this.currentProphecy.archetype}`,
            text: this.currentProphecy.text,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback para browsers sem Web Share API
                const text = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
                await navigator.clipboard.writeText(text);
                alert('Link copiado para a clipboard!');
            }
        } catch (error) {
            console.error('Erro ao partilhar:', error);
            // Fallback final
            const text = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
            prompt('Copia este texto para partilhar:', text);
        }
    }
    
    // Event listeners
    initEventListeners() {
        // Botão para encontrar profecia por código
        document.getElementById('find-prophecy-btn').addEventListener('click', () => {
            const code = document.getElementById('code-input').value.trim();
            if (code) {
                this.loadProphecyByCode(code);
            }
        });
        
        // Enter no input de código
        document.getElementById('code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const code = e.target.value.trim();
                if (code) {
                    this.loadProphecyByCode(code);
                }
            }
        });
        
        // Auto-formatar input de código
        document.getElementById('code-input').addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
            e.target.value = value;
        });
        
        // Botão de download
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadImage();
        });
        
        // Botão de partilha
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareProphecy();
        });
        
        // Botão "Nova Profecia"
        document.getElementById('new-prophecy-btn').addEventListener('click', () => {
            window.location.href = window.location.pathname; // Recarregar sem parâmetros
        });
        
        // Botão "Tentar Novamente"
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.checkURL();
        });
        
        // Botão "Voltar ao input"
        document.getElementById('back-to-input-btn').addEventListener('click', () => {
            this.setState(STATES.CODE_INPUT);
        });
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.prophcyApp = new ProphcyWebApp();
});