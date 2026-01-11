import { Col, Container, Row } from 'react-bootstrap'

import PageBreadcrumb from '@/components/PageBreadcrumb'
import PetsCard from './components/PetsCard'


const Page = () => {
    return (
        <Container fluid>
            <PageBreadcrumb title="Customers" subtitle="Ecommerce" />

            <Row className="justify-content-center">
                <Col xxl={12}>
                    <PetsCard />
                </Col>
            </Row>
        </Container>
    )
}

export default Page
