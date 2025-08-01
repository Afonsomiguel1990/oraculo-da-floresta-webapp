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
    async displayProphecy(prophecy) {
        this.currentProphecy = prophecy;
        
        // Atualizar elementos da interface
        document.getElementById('archetype-name').textContent = `Arquétipo: ${prophecy.archetype}`;
        document.getElementById('prophecy-text-content').textContent = prophecy.text;
        
        // Configurar imagem da profecia
        const imgContainer = document.querySelector('.prophecy-image-container');
        const img = document.getElementById('prophecy-image');
        const generateSection = document.getElementById('generate-image-section');
        
        // Esconder seção de gerar sempre
        generateSection.style.display = 'none';
        imgContainer.style.display = 'block';
        
        if (prophecy.story_image_url) {
            console.log('Carregando imagem existente:', prophecy.story_image_url);
            
            // Mostrar placeholder enquanto carrega
            this.showImagePlaceholder('Carregando a tua imagem mística...');
            
            img.src = prophecy.story_image_url;
            img.style.display = 'block';
            
            img.onload = () => {
                console.log('Imagem carregada com sucesso');
                this.hideImagePlaceholder();
                this.setState(STATES.PROPHECY);
            };
            
            img.onerror = () => {
                console.error('Erro ao carregar imagem, gerando nova automaticamente');
                this.generateProphecyImage(prophecy.id);
            };
        } else {
            console.log('Sem URL de imagem, gerando automaticamente');
            
            // Gerar imagem automaticamente
            await this.generateProphecyImage(prophecy.id);
        }
        
        // Atualizar meta tags para partilha
        this.updateMetaTags(prophecy);
    }
    
    // Mostrar placeholder de imagem
    showImagePlaceholder(message = 'Gerando a tua imagem mística...') {
        const imgContainer = document.querySelector('.prophecy-image-container');
        const img = document.getElementById('prophecy-image');
        
        // Esconder imagem
        img.style.display = 'none';
        
        // Criar ou mostrar placeholder
        let placeholder = imgContainer.querySelector('.image-placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            imgContainer.appendChild(placeholder);
        }
        placeholder.innerHTML = message;
        placeholder.style.display = 'flex';
    }
    
    // Esconder placeholder de imagem
    hideImagePlaceholder() {
        const imgContainer = document.querySelector('.prophecy-image-container');
        const placeholder = imgContainer.querySelector('.image-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    }
    
    // Gerar imagem da profecia (chamar render-story)
    async generateProphecyImage(prophecyId) {
        try {
            console.log('Gerando imagem para prophecy_id:', prophecyId);
            
            // Mostrar placeholder de carregamento
            this.showImagePlaceholder('Criando a tua imagem mística...');
            
            const response = await fetch(`${SUPABASE_URL}/functions/v1/render-story`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ prophecy_id: prophecyId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Resposta do render-story:', result);
            
            if (result.image_url) {
                // Carregar nova imagem
                const img = document.getElementById('prophecy-image');
                img.src = result.image_url;
                img.style.display = 'block';
                
                img.onload = () => {
                    console.log('Nova imagem gerada e carregada com sucesso');
                    this.hideImagePlaceholder();
                    this.setState(STATES.PROPHECY);
                    
                    // Atualizar profecia com novo URL
                    this.currentProphecy.story_image_url = result.image_url;
                };
                
                img.onerror = () => {
                    console.error('Erro ao carregar nova imagem gerada');
                    this.showImagePlaceholder('Erro ao carregar imagem');
                    this.setState(STATES.PROPHECY);
                };
            } else {
                throw new Error('Resposta não contém image_url');
            }
            
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            
            // Mostrar erro no placeholder
            this.showImagePlaceholder('Erro ao gerar imagem');
            this.setState(STATES.PROPHECY);
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
            link.download = `profecia-${this.currentProphecy.archetype}.svg`;
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