import express from 'express';
import ReservaController from '../controllers/ReservaController.js';
import FaleController from '../controllers/FaleController.js';
import CardapioController from '../controllers/menuController.js'; 
import CadastroController from '../controllers/CadastroController.js';
import LoginController from '../controllers/LoginController.js';
import PedidoController from '../controllers/PedidoController.js';
import UsuariosController from '../controllers/Usuarios_controller.js';


const router = express.Router();


// MIDDLEWARE: Requer que o usuário esteja logado E SEJA CLIENTE (não admin)
function checkClient(req, res, next) {
    console.log(`[checkClient] Sessão atual:`, req.session);

    // Se a sessão não existir, redireciona pro login
    if (!req.session || !req.session.userName) {
        console.log('⚠️ Nenhum usuário logado — redirecionando pro login.');
        return res.redirect('/Login/new');
    }

    // Se for admin, BLOQUEIA o acesso (Comportamento Original da sua função)
    if (req.session.isAdmin === true) {
        console.log(`🚫 Bloqueado: ${req.session.userName} é admin e tentou acessar página restrita a clientes.`);
        return res.render('Aviso', {
            titulo: 'Acesso Negado',
            mensagem: `Não é possível acessar a pagina desejada, pois você é um administrador.`
        });
    }

    // Se for cliente, segue normalmente
    console.log(`✅ Acesso liberado para cliente: ${req.session.userName}`);
    next();
}

// 🔑 NOVO MIDDLEWARE: Requer que o usuário esteja logado E SEJA ADMINISTRADOR
function requireAdmin(req, res, next) {
    console.log(`[requireAdmin] Sessão atual:`, req.session);

    // 1. Verifica se está logado
    if (!req.session || !req.session.userName) {
        console.log('⚠️ Nenhum usuário logado — redirecionando pro login (Rota Admin).');
        return res.redirect('/Login/new');
    }

    // 2. Verifica se é admin
    if (req.session.isAdmin !== true) {
        console.log(`🚫 Bloqueado: ${req.session.userName} é cliente e tentou acessar área de administração.`);
        return res.render('Aviso', {
            titulo: 'Acesso Restrito',
            mensagem: `Você não tem permissão de administrador para acessar esta página.`
        });
    }

    // 3. É admin, libera
    console.log(`✅ Acesso liberado para ADMIN: ${req.session.userName}`);
    next();
}


// Rota para a página inicial
router.get('/', (req, res) => {
    res.render('Base');
});
router.post("/fale/add", FaleController.addNewFale);

// Rotas de Reserva (Protegidas para CLIENTES)
router.get('/reserva/new', checkClient, ReservaController.showFormReserva);
router.post('/reserva/add', checkClient, ReservaController.addNewReserva);

router.get('/admin/usuarios', requireAdmin, UsuariosController.listarUsuarios);

router.get('/Pedido/new', checkClient, PedidoController.showFormPedido);
router.post('/Pedido/add', checkClient, PedidoController.addNewPedido);


// Rotas de Login
router.get('/Login/new', LoginController.showFormLogin); 

router.post('/Login/add', (req, res, next) => {
    console.log('--- ROTA DE LOGIN POST FOI ATINGIDA ---'); 
    console.log('Conteúdo de req.body:', req.body); 
    if (Object.keys(req.body).length === 0) {
        console.error("⚠️ REQ.BODY ESTÁ VAZIO! O Body Parser pode estar com problemas no app.js.");
    }
    next();
}, LoginController.authenticateLogin); 


// Rotas de Cadastro
router.get('/Cadastro/new', CadastroController.showFormCadastro);
router.post('/Cadastro/add', CadastroController.addNewCadastro);



router.get('/cardapio', CardapioController.showCardapio); 

// 2. CREATE: Rotas protegidas para ADMIN
router.get('/admin/cardapio/add', requireAdmin, CardapioController.showAddForm);
router.post('/admin/cardapio/add', requireAdmin, CardapioController.addProduto);

// 3. UPDATE: Rotas protegidas para ADMIN
router.get('/admin/cardapio/edit/:id', requireAdmin, CardapioController.showEditForm);
router.post('/admin/cardapio/edit/:id', requireAdmin, CardapioController.editProduto);

// 4. DELETE: Rotas protegidas para ADMIN
router.post('/admin/cardapio/delete/:id', requireAdmin, CardapioController.deleteProduto);

export default router;