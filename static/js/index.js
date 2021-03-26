var Navbar = ReactBootstrap.Navbar,
Nav = ReactBootstrap.Nav,
Button = ReactBootstrap.Button,
Collapse = ReactBootstrap.Collapse;

var text_for_page = {
    butterfly: "Butterfly Web Terminal - браузерная версия стандартного Linux терминала.",
    code: "Code-Oss IDE - это современная среда разработки. С его помощью можно запускать ROS систему, писать программы, отлаживать код, взаимодействовать с Linux по средству встроенного терминала, просматривать файлы.",
    bricks: "Pioneer Bricks – визуальная, блочная, браузерная среда разработки, обладающая всем функционалом современных IDE (создать файл, открыть файл, сохранить файл, консоль отладки). Данная среда прекрасно подойдет для детей, только начавших изучать программирование. Основной плюс данной среды – это простота использования, а так же моментальное исполнение программы."
}

class MyNavItem extends React.Component{
    render() {
        return (
            <Nav.Item className={this.props.class}>
                <Nav.Link aria-controls={this.props.aria_controls} aria-expanded={this.props.aria_expanded} onClick={this.props.onclick}>{this.props.text}</Nav.Link>
            </Nav.Item>
        );
    }
}

class MyForm extends React.Component{
    render() {
        var content_style = {
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth}px`
        }

        var vars = document.getElementById("var")
        return (
            <div style={content_style}>
                <br></br>
                <form>
                    <h1 id="openh1">{this.props.name}</h1>
                    <h5 id="openh2">{this.props.text}</h5>
                    <Button id="open" variant="outline-success" href={`http://${vars.getAttribute("hostname")}:${vars.getAttribute(this.props.app)}`}>Открыть</Button>
                </form>
            </div>
        );
    }
}

class MyNav extends React.Component {
    constructor(props, context) {
		super(props, context);

        this.myInput = React.createRef();
		this.state = {
			open: false,
		};
	}
    
    render() {
        const { open } = this.state;
        return (
            <Navbar ref={this.myInput} id="mainnav" bg="light" className="scroll">
                <Navbar.Brand>
                    <img
                        src="/static/img/logo.svg"
                        width="200"
                        height="50"
                    />
                </Navbar.Brand>
                <Nav id="menu">
                    <MyNavItem text="Web Terminal" onclick={() => ReactDOM.render(<MyForm name="Web Terminal" app="butterfly" text={text_for_page.butterfly} nav_ref={this.myInput}/>, document.getElementById("content"))}/>
                    <MyNavItem text="Code-oss" onclick={() => ReactDOM.render(<MyForm name="Code-oss" app="code" text={text_for_page.code} nav_ref={this.myInput}/>, document.getElementById("content"))}/>
                    <MyNavItem text="Pioneer Bricks" onclick={() => ReactDOM.render(<MyForm name="Pioneer Bricks" app="bricks" text={text_for_page.bricks} nav_ref={this.myInput}/>, document.getElementById("content"))}/>
                    <MyNavItem
                        text="ROS"
                        onclick={() => this.setState({ open: !open })}
					    aria_controls="collapse-menu"
					    aria_expanded={open}                 
                    />
                    <Collapse in={this.state.open}>
					    <div id="collapse-menu">
                            <MyNavItem text="Управление ROS" class="menu-item"/>
                            <MyNavItem text="Node List" class="menu-item"/>
                            <MyNavItem text="Service List" class="menu-item"/>
                            <MyNavItem text="Topic List" class="menu-item"/>
                        </div>
				    </Collapse>
                </Nav>
            </Navbar>
        )
    }
}

class App extends React.Component {
    render() {
        return (
            <div>
                <MyNav/>
                <div id="content"/>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);