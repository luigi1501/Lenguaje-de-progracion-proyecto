const express = require('express');
const router = express.Router();
const { registrarEmpleado, obtenerEmpleadoPorUsuario, verificarPassword } = require('../db/models');

router.get('/login-empleado', (req, res) => {
    res.render('login-empleado', { error: req.query.error });
});

router.post('/login-empleado', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const empleado = await obtenerEmpleadoPorUsuario(usuario);
        if (empleado) {
            console.log('Empleado encontrado para', usuario + ':', empleado);
            const passwordValido = await verificarPassword(password, empleado.password_hash);
            console.log('¿Contraseña válida?', passwordValido);

            if (passwordValido) {
                console.log('Inicio de sesión exitoso para:', usuario);
                res.render('panel-empleado', {
                    userId: empleado.id,
                    nombreEmpleado: empleado.nombre
                });
            } else {
                console.log('Contraseña incorrecta para empleado:', usuario);
                res.redirect('/auth/login-empleado?error=incorrectPassword');
            }
        } else {
            console.log('Empleado no encontrado:', usuario);
            res.redirect('/auth/login-empleado?error=employeeNotFound');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.redirect('/auth/login-empleado?error=loginFailed');
    }
});

router.get('/registro-empleado', (req, res) => {
    res.render('registro-empleado', { error: req.query.error });
});

router.post('/registro-empleado', async (req, res) => {
    const { usuario, password, nombre, apellido, cedula, cargo, departamento, telefono, correo } = req.body;

    try {
        const empleadoId = await registrarEmpleado(usuario, password, nombre, apellido, parseInt(cedula), cargo, departamento, parseInt(telefono), correo);
        console.log('Empleado registrado correctamente.');
        res.redirect('/auth/login-empleado');
    } catch (error) {
        console.error('Error al registrar empleado:', error);
        let errorParam = 'registrationFailed';
        if (error.message.includes('UNIQUE constraint failed: empleados.usuario')) {
            errorParam = 'usernameTaken';
        } else if (error.message.includes('UNIQUE constraint failed: empleados.correo')) {
            errorParam = 'emailTaken';
        } else if (error.message === 'La cédula ya está registrada.') {
            errorParam = 'cedulaTaken';
        }
        res.redirect(`/auth/registro-empleado?error=${errorParam}`);
    }
});

module.exports = router;