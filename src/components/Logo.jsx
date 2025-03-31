import { Link } from "react-router-dom"
import "./Logo.css"

const Logo = () => {
  return (
    <Link to="/" className="logo">
            <img 
              src = "https://i.postimg.cc/9FsfpRHk/logo.png" style={{
                height:40 
              }}
            />
            <span className="logo-text">
              <strong> CNNCT</strong> 
            </span>
          </Link>
  )
}

export default Logo

