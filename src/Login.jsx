import React, { useState } from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseurl } from './helper/Helper';
import { useAuth } from './context/auth';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [auth, setAuth] = useAuth();
    console.log(baseurl)

    const onFinish = async (values) => {
        console.log(values)
        setLoading(true);
        try {
            const response = await axios.post(baseurl+ '/api/admin/login', {
                email: values.username, 
                password: values.password,
            });

            console.log(response.data);
            console.log(response.data.success);
            console.log(response.data.token);

            if ( response.data.success) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('auth', JSON.stringify(response.data));
                setAuth({
                    ...auth,
                    user: response.data.admin,
                    token: response.data.token,
                  });
                message.success('Login successful!');
                navigate('/admin'); 
            } else {
                message.error('Invalid email or password');
            }
        } catch (error) {
            message.error('Invalid email or password');
        }
        setLoading(false);
    };


  
    return (
        <div style={{ maxWidth: '300px', margin: '100px auto', padding: '30px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Login</h2>
            <Form
                name="login_form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please enter your email!' }]}
                >
                    <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password!' }]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>

               

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Login
                    </Button>
                </Form.Item>
            </Form>

          
        </div>
    );
};

export default Login;
