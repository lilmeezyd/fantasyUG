import { useState, useEffect } from "react"
import { Row, Col, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLoginMutation } from "../slices/userApiSlice"
import { setCredentials } from '../slices/authSlice'
import { toast } from 'react-toastify'
import Loader from "../components/Loader"
import {Button} from "../../@/components/ui/button"
const LoginScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [login, { isLoading }] = useLoginMutation()

    const { userInfo } = useSelector((state) => state.auth)

    useEffect(() => {
      if(userInfo) {
        navigate('/')
      }
    }, [navigate, userInfo])
    

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
          const res = await login({ email, password}).unwrap()
          dispatch(setCredentials({...res}))
          navigate('/')
        } catch (err) {
            toast.error(err?.data?.message || err.error)
        }
    }
    return (
        <>
            <h4>Sign In</h4>
            <Form className="login-cs" onSubmit={onSubmit}>
                <Form.Group className="login-cs-child" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Form.Group className="login-cs-child" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                {isLoading && <Loader />}
                <div className="login-cs-child">
                    <div></div>
                <Button type="submit" className="bg-blue-500 text-white">
                    Sign In
                </Button>
                </div>
                <Row className="login-cs-child">
                    <div></div>
                    <div style={{fontWeight: 600}}>
                    New User? <Link to='/register'>Register</Link></div>
                </Row>
            </Form>
            </>
    )
}

export default LoginScreen