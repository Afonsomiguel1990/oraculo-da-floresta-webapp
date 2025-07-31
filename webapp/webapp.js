// Configuração Supabase
const SUPABASE_URL = 'https://bnaklbyemcijyabcfjhx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuYWtsYnllbWNpanlhYmNmamh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjAwODksImV4cCI6MjA2OTQzNjA4OX0.MOds9hnUVD87Gm-J-gIGWWcRDj6p2X0AKRpaZ2Yqx0Q';

// App Class
class OracleApp {
    constructor() {
        this.currentProphecy = null;
        this.init();
    }
    
    init() {
        console.log('🌲 Oráculo da Floresta iniciado');
        this.setupEventListeners();
        this.checkURL();
    }
    
    // Verificar URL e decidir ecrã inicial
    checkURL() {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('s');
        const prophecyId = params.get('id');
        
        if (sessionId) {
            this.loadBySession(sessionId);
        } else if (prophecyId) {
            this.loadById(prophecyId);
        } else {
            // MOSTRAR CÓDIGO INPUT (não loading!)
            this.showScreen('code');
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Buscar profecia
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchProphecy();
        });
        
        // Enter no input
        document.getElementById('code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchProphecy();
            }
        });
        
        // Auto-format input
        document.getElementById('code-input').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        });
        
        // Ações na profecia
        document.getElementById('share-btn').addEventListener('click', () => this.share());
        document.getElementById('new-btn').addEventListener('click', () => this.newProphecy());
        
        // Erro
        document.getElementById('retry-btn').addEventListener('click', () => this.checkURL());
        document.getElementById('back-btn').addEventListener('click', () => this.showScreen('code'));
    }
    
    // Buscar profecia por código
    async searchProphecy() {
        const code = document.getElementById('code-input').value.trim();
        
        if (!code) {
            alert('Introduz um código');
            return;
        }
        
        this.showScreen('loading');
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/prophecies?short_code=eq.${code}&select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            const data = await response.json();
            
            if (data.length === 0) {
                throw new Error(`Código "${code}" não encontrado`);
            }
            
            this.displayProphecy(data[0]);
            
        } catch (error) {
            console.error('Erro:', error);
            this.showError(error.message);
        }
    }
    
    // Carregar por session_id
    async loadBySession(sessionId) {
        this.showScreen('loading');
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/prophecies?session_id=eq.${sessionId}&select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            const data = await response.json();
            
            if (data.length === 0) {
                throw new Error('Profecia não encontrada');
            }
            
            this.displayProphecy(data[0]);
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    // Carregar por ID
    async loadById(prophecyId) {
        this.showScreen('loading');
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/prophecies?id=eq.${prophecyId}&select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            const data = await response.json();
            
            if (data.length === 0) {
                throw new Error('Profecia não encontrada');
            }
            
            this.displayProphecy(data[0]);
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    // Mostrar profecia
    displayProphecy(prophecy) {
        this.currentProphecy = prophecy;
        
        // Preencher dados
        document.getElementById('archetype').textContent = `Arquétipo: ${prophecy.archetype}`;
        document.getElementById('prophecy-text').textContent = prophecy.text;
        document.getElementById('prophecy-code').textContent = prophecy.short_code;
        
        // Atualizar meta tags
        document.title = `${prophecy.archetype} - Oráculo da Floresta`;
        
        // Mostrar ecrã
        this.showScreen('prophecy');
    }
    
    // Mostrar erro
    showError(message) {
        document.getElementById('error-message').textContent = message;
        this.showScreen('error');
    }
    
    // Mudar ecrã
    showScreen(screenName) {
        // Esconder todos
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        // Mostrar o correto
        document.getElementById(`${screenName}-screen`).classList.add('active');
        
        console.log(`📱 Ecrã: ${screenName}`);
    }
    
    // Partilhar
    async share() {
        if (!this.currentProphecy) return;
        
        const data = {
            title: `A Minha Profecia: ${this.currentProphecy.archetype}`,
            text: this.currentProphecy.text,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(data);
            } else {
                const text = `${data.title}\n\n${data.text}\n\n${data.url}`;
                await navigator.clipboard.writeText(text);
                alert('Link copiado!');
            }
        } catch (error) {
            const text = `${data.title}\n\n${data.text}\n\n${data.url}`;
            prompt('Copia este texto:', text);
        }
    }
    
    // Nova profecia
    newProphecy() {
        // Limpar input
        document.getElementById('code-input').value = '';
        // Voltar ao início
        this.showScreen('code');
    }
}

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
    window.oracleApp = new OracleApp();
    console.log('✅ App pronta - deve mostrar campo código!');
});