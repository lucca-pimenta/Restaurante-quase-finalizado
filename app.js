import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import appRoutes from './routes/routes.js';
import session from 'express-session'; 

// 💡 1. IMPORTAÇÕES DO BANCO DE DADOS E DO MODELO
import db from './models/db.js'; 
import CARDAPIO, { DADOS_INICIAIS_CARDAPIO } from './models/MenuModel.js'; 

// Configurações de caminho
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 

// 2. MIDDLEWARE DE SESSÃO 
app.use(session({
    secret: 'SUPER_SECRETO', 
    resave: false, 
    saveUninitialized: false, 
    cookie: { 
        maxAge: 60 * 60 * 1000 // 1 hora
    } 
}));

// 3. OUTROS MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Configura o mecanismo de template Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// 🔹 MIDDLEWARE GLOBAL — envia info do usuário p/ todas as views
app.use((req, res, next) => {
    res.locals.isAdmin = req.session && req.session.isAdmin === true;
    res.locals.userName = req.session && req.session.userName;
    next();
});

// Usa as rotas importadas
app.use('/', appRoutes);

// 4. INICIALIZAÇÃO DO BANCO DE DADOS E SINCRONIZAÇÃO
const startServer = async () => {
    try {
        // Tenta autenticar a conexão com o banco de dados
        await db.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

        // Sincroniza todos os modelos (cria/atualiza tabelas se necessário)
        await db.sync({ alter: true }); 
        console.log('✅ Modelos sincronizados com o banco de dados.');

        // LÓGICA DE INSERÇÃO DE DADOS INICIAIS
        const count = await CARDAPIO.count();

        if (count === 0) {
            await CARDAPIO.bulkCreate(DADOS_INICIAIS_CARDAPIO);
            console.log('✅ Dados iniciais do cardápio inseridos com sucesso!');
        } else {
            console.log(`Tabela cardapios já contém ${count} itens. Não foram inseridos dados iniciais.`);
        }

        // Inicia o servidor somente APÓS o DB estar pronto e preenchido
        const PORT = 1112;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Não foi possível conectar/sincronizar o banco de dados. Causa:', error.message);
        console.error('Verifique as credenciais no seu db.js e certifique-se de que o servidor MySQL está rodando.');
    }
};

// Inicia o processo de conexão
startServer();
