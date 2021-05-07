var Navbar = ReactBootstrap.Navbar,
Nav = ReactBootstrap.Nav,
Button = ReactBootstrap.Button,
Collapse = ReactBootstrap.Collapse,
Table = ReactBootstrap.Table;

var text_for_page = {
    butterfly: "Butterfly Web Terminal - браузерная версия стандартного Linux терминала.",
    code: "Code-Oss IDE - это современная среда разработки. С его помощью можно запускать ROS систему, писать программы, отлаживать код, взаимодействовать с Linux по средству встроенного терминала, просматривать файлы.",
    bricks: "Pioneer Bricks – визуальная, блочная, браузерная среда разработки, обладающая всем функционалом современных IDE (создать файл, открыть файл, сохранить файл, консоль отладки). Данная среда прекрасно подойдет для детей, только начавших изучать программирование. Основной плюс данной среды – это простота использования, а так же моментальное исполнение программы."
}

class RosTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          status: -1,
          result: []
        };
    }

    render () {
        const { status, result } = this.state;
        fetch(this.props.api)
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                status: result.status,
                result: result.result
              });
            }
          );

        var content_style = {
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth - 60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };
        
        if (status==0){    
            return (
                <div style={content_style}>
                    <h1 id="openh1">Список ROS {this.props.name}</h1>
                    <Table id="rostable" bordered >
                        <thead id="header">
                            <tr>
                            {this.props.header.map((column) => (
                                <th>{column}</th>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row) => (
                                <tr>
                                    {
                                        row.map((content) => (
                                            <td>{content}</td>
                                        ))
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            );
        } else {
            return (
                <div style={content_style}>
                    <h1 id="openh1">ROS ядро не запущено</h1>
                </div>
            );
        }
    }
}

class RosManager extends React.Component {
    api = `http://${document.getElementById("var").getAttribute("hostname")}:${document.getElementById("var").getAttribute("port")}`

    constructor(props) {
        super(props);
        this.state = {
          core: -1,
          launch: -1
        };
        this.roscoreClick = this.roscoreClick.bind(this);
        this.roslaunchClick = this.roslaunchClick.bind(this);
    }

    roscoreClick() {
        const { core, launch } = this.state;
        var requestOption = {};

        if (core == 1) {
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 0})
            };
        }else{
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 1 })
            };
        }

        fetch(this.api+"/core", requestOption);
    }

    roslaunchClick() {
        const { core, launch } = this.state;
        var requestOption = {};

        if (launch == 1) {
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 0})
            };
        } else {
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 1 })
            };
        }

        fetch(this.api+"/launch", requestOption);
    }

    render() {
        const { core, launch } = this.state;
        fetch(this.api+"/status")
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                core: result.core,
                launch: result.launch
              });
            }
          );
        var content_style = {
            display: "inline-grid",
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth -60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };

        var core_button = <Button></Button>;

        if (core == 1) {
            core_button = <Button id="roscore" variant="outline-danger" onClick={this.roscoreClick}>Выключить ядро ROS</Button>;
        }else{
            core_button = <Button id="roscore" variant="outline-success" onClick={this.roscoreClick}>Включить ядро ROS</Button>;
        }

        var launch_button = <Button></Button>;

        if (launch == 1) {
            launch_button = <Button id="roslaunch" variant="outline-danger" onClick={this.roslaunchClick}>Выключить ROS систему</Button>;
        } else {
            launch_button = <Button id="roslaunch" variant="outline-success" onClick={this.roslaunchClick}>Включить ROS систему</Button>;
        }

        return (
            <div style={content_style}>
                {core_button}
                {launch_button}
            </div>
        )
    }
}

class WebMenuNavItem extends React.Component{
    render() {
        return (
            <Nav.Item className={this.props.class}>
                <Nav.Link aria-controls={this.props.aria_controls} aria-expanded={this.props.aria_expanded} onClick={this.props.onclick}>{this.props.text}</Nav.Link>
            </Nav.Item>
        );
    }
}

class WebAppForm extends React.Component{
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

class WebMenuNav extends React.Component {
    constructor(props, context) {
		super(props, context);

        this.myInput = React.createRef();
		this.state = {
			open: false,
		};
	}
    
    render() {
        const { open } = this.state;
        var butterfly_button = "";
        if (document.getElementById("var").getAttribute("butterfly") != -1) {
            butterfly_button = <WebMenuNavItem text="Web Terminal" onclick={() => ReactDOM.render(<WebAppForm name="Web Terminal" app="butterfly" text={text_for_page.butterfly} nav_ref={this.myInput}/>, document.getElementById("content"))}/>;
        }

        var pioneer_bricks = "";
        if (document.getElementById("var").getAttribute("bricks") != -1) {
            pioneer_bricks = <WebMenuNavItem text="Pioneer Bricks" onclick={() => ReactDOM.render(<WebAppForm name="Pioneer Bricks" app="bricks" text={text_for_page.bricks} nav_ref={this.myInput}/>, document.getElementById("content"))}/>;
        }

        var code = "";
        if (document.getElementById("var").getAttribute("code") != -1) {
            code = <WebMenuNavItem text="Pioneer Bricks" onclick={() => ReactDOM.render(<WebAppForm name="Pioneer Bricks" app="bricks" text={text_for_page.bricks} nav_ref={this.myInput}/>, document.getElementById("content"))}/>;
        }

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
                    {butterfly_button}
                    {code}
                    {pioneer_bricks}
                    <WebMenuNavItem
                        text="ROS"
                        onclick={() => this.setState({ open: !open })}
					    aria_controls="collapse-menu"
					    aria_expanded={open}                 
                    />
                    <Collapse in={this.state.open}>
					    <div id="collapse-menu">
                            <WebMenuNavItem text="Управление ROS" class="menu-item" onclick={() => ReactDOM.render(<RosManager nav_ref={this.myInput}/>,document.getElementById("content") )}/>
                            <WebMenuNavItem text="Список узлов" class="menu-item" onclick={() => ReactDOM.render(<RosTable nav_ref={this.myInput} header={["Название"]} api="/node" name="Nodes"/>,document.getElementById("content"))}/>
                            <WebMenuNavItem text="Список сервисов" class="menu-item" onclick={() => ReactDOM.render(<RosTable nav_ref={this.myInput} header={["Название", "Тип", "Родительский узел"]} api="/service" name="Services"/>,document.getElementById("content"))}/>
                            <WebMenuNavItem text="Список тем" class="menu-item" onclick={() => ReactDOM.render(<RosTable nav_ref={this.myInput} header={["Название", "Тип", "Публикующий узел"]} api="/topic" name="Topics"/>,document.getElementById("content"))}/>
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
                <WebMenuNav/>
                <div id="content"/>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);