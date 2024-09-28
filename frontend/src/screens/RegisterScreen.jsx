import { useState, useEffect } from "react"
import { Row, Col, Button, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import { useRegisterMutation } from "../slices/userApiSlice"
import { setCredentials } from "../slices/authSlice"
import { toast } from "react-toastify"
import Loader from "../components/Loader"

const RegisterScreen = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [register, { isLoading }] = useRegisterMutation()
    const { userInfo } = useSelector((state) => state.auth)

    useEffect(() => {
        if(userInfo) {
          navigate('/')
        }
      }, [navigate, userInfo])

    const onSubmit = async (e) => {
        e.preventDefault()
        if(password !== confirmPassword) {
            toast.error('Passwords do not match')
        } else {
            try {
                const res = await register({ firstName, lastName, email, password}).unwrap()
                console.log(res)
                dispatch(setCredentials({...res}))
                navigate('/') 
            } catch (err) {
                toast.error(err?.data?.message || err.error)
            }
        }
    }
    return (
        <FormContainer>
            <h4>Register</h4>
            <Form onSubmit={onSubmit}>
            <Form.Group className="my-2 login-cs-child" controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Form.Group className="my-2 login-cs-child" controlId="lastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Form.Group className="my-2 login-cs-child" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Form.Group className="my-2 login-cs-child" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                <Form.Group className="my-2 login-cs-child" controlId="password">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    ></Form.Control>
                </Form.Group>
                {isLoading && <Loader />}
                <Button type="submit" variant="primary" className="mt-3 form-control">
                    Register
                </Button>

                <Row className="py-3 login-cs-child">
                <div></div>
                <div style={{fontWeight: 600}}>
                    Already have an account? <Link to='/login'>Sign In</Link></div>
                </Row>
            </Form>
        </FormContainer>
    )
}

export default RegisterScreen