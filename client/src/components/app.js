import 'bootstrap/dist/css/bootstrap.css';

import { h, Component } from 'preact';
import { Router } from 'preact-router';


import style from "../style/app.less";



import Header from './header';
import Home from './home';
import Vlille from './vlille';
import VlilleStation from './vlille/VlilleStation';

export default class App extends Component {
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<div id="app">
				<Header />
				<div class={style.content}>
					<Router onChange={this.handleRoute}>
						<Home path="/" />
						<Vlille path="/vlille"/>
						<VlilleStation path="/vlille/:stationId" />
					</Router>
				</div>
			</div>
		);
	}
}
