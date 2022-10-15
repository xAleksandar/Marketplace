import {
    Link
} from "react-router-dom";
import { Navbar, Nav, Button, Container } from 'react-bootstrap'
import market from './logo.jpeg'
//import './App.css'
const Navigation = ({ web3Handler, account }) => {
    return (
        <Navbar expand="lg" className="Navibar" bg="secondary" variant="dark">
            <Container>
                <Navbar.Brand style={{ display: "flex" }} href="">
                    {/*<img src={market} width="40" height="40" className="" alt="" /> */}
                    <img src={market} width="40" height="40" className="" alt="" />
                    <h1 style={{margin: "8px auto"}}>&nbsp; NFT Marketplace</h1>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/Collections">Collections</Nav.Link>
                        <Nav.Link as={Link} to="/create">Create Collection</Nav.Link>
                        <Nav.Link as={Link} to="/MintNFT">Mint NFT</Nav.Link>
                        <Nav.Link as={Link} to="/my-listed-items">My Listed Items</Nav.Link>
                        <Nav.Link as={Link} to="/my-items">My Items</Nav.Link>
                    </Nav>
                    <Nav>
                        {account ? (
                            <Nav.Link
                                href={`https://etherscan.io/address/${account}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button nav-button btn-sm mx-4">
                                <Button variant="outline-light">
                                    {account.slice(0, 5) + '...' + account.slice(38, 42)}
                                </Button>

                            </Nav.Link>
                        ) : (
                            <Button onClick={web3Handler} className="Navibar" variant="outline-light">Connect Wallet</Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

}

export default Navigation;