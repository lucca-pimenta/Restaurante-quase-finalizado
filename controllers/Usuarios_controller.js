import CADASTRO from '../models/Cadastro.js';

const UsuariosController = {
    async listarUsuarios(req, res) {
        try {
            const usuarios = await CADASTRO.findAll({ raw: true }); // pega todos do banco
            
            const isAdmin = req.session && req.session.isAdmin === true; // pra controlar permissões
            
            res.render('usuarios', { 
                usuarios, 
                isAdmin 
            });
        } catch (error) {
            console.error("Erro ao listar usuários:", error);
            res.status(500).send('Erro ao carregar lista de usuários.');
        }
    }
};

export default UsuariosController;
