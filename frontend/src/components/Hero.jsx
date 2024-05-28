import { Container, Card, Button } from 'react-bootstrap'

const Hero = () => {
  return (
    <div className="py-5">
        <Container className='d-flex justify-content-center'>
            <Card className="p-5 d-flex flex-column align-items-center hero-card bg-light w-75">
                <h1 className="text-center mb-4">
                    MERN Authentication
                </h1>
                <p className="text-center mb-4">
                    This is a boilerplate for MERN authentication that stores a JWT token in 
                    an HTTP-Only cookie.
                </p>
                <div className="d-flex">
                    <Button variant='primary' href='/login' className="ms-3">
                        Sign In
                    </Button>
                    <Button variant='primary' href='/register' className="ms-3">
                        Register
                    </Button>
                </div>
            </Card>
        </Container>
    </div>
  )
}

export default Hero