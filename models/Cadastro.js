import { Sequelize, sequelize } from './db.js'; 

const CADASTRO = sequelize.define('Cadastro', {
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Senha: { 
        type: Sequelize.STRING,
        allowNull: false
    },
    Cargo: { 
        type: Sequelize.STRING,
        allowNull: false 
    }
})

sequelize.sync({ force: false })
    .then(() => {  
        console.log('Tabela cadastro criada com sucesso!');
    })
    .catch((error) => {
        console.error('Erro ao criar tabela cadastro:', error);
    });

// Export the Produtos model
export default CADASTRO;