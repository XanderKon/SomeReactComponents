define('sidePanel', function () {

    // Dispatchers
    let Dispatcher = require('common/dispatchers').app;

    let dispatcherHandler = require('common/commonMixin').dispatcherHandler;

    let constants = require('constants/constants').ActionTypes;

    let Preloader = require('jsx!../common/preloader');

    // STORES
    let Stores = require('models/dataProvider'),
        detailsStore = Stores.Details;

    let Project = React.createClass({
        displayName: 'Project',

        componentWillUpdate: function (nextProps) {

            if (this.props.project != nextProps.project) {

                if (!_.isEqual(this.props.project.spider, nextProps.project.spider)) {

                    setTimeout(function () {
                        Dispatcher.dispatch({
                            actionType: constants.DRAW_SPIDER,
                            data: nextProps.project.spider
                        });
                    }, 10);
                }

                setTimeout(function () {
                    Dispatcher.dispatch({
                        actionType: constants.DRAW_REGION,
                        data: nextProps.main
                    });
                }, 20);
            }
        },

        componentDidMount: function () {

            Dispatcher.dispatch({
                actionType: constants.DRAW_SPIDER,
                data: this.props.project.spider
            });

            Dispatcher.dispatch({
                actionType: constants.DRAW_REGION,
                data: this.props.main
            });
        },

        render: function () {

            var project = this.props.project;
            var main = this.props.main;

            return (
                <div className="project">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="text-right header">
                                <div className="pull-right text-left">
                                    {main.country == 'Россия' ? 'Регионы Российской Федерации:' : main.country}<br />
                                    <span className="regions-header">
                                        {main.region ? main.region : ''}
                                        {main.city ? (", " + main.city) : ''}
                                    </span>
                                </div>
                                <div className="fa fa-map-marker pull-right icon"></div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="project-details">
                                <div className="category">
                                    {project.details.category}
                                </div>
                                <div className="project-title">
                                    <span className="title-span">Проект</span>
                                    <div className="text-padding">{project.details.title}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                                {project.events  ? (
                                    <div className="project-events">
                                        <span className="title-span">События</span>
                                        <div className="text-padding">
                                            <table>
                                                <tbody>
                                                    {project.events.map(function (item, index) {
                                                        return (
                                                            <tr key={index} className="result-row">
                                                                <td className="indexer">
                                                                    <div>{index + 1}.</div>
                                                                </td>
                                                                <td>
                                                                    <div className="event-content">
                                                                        {item.title}<br />
                                                                        Место проведения: {item.place}<br />
                                                                        {item.date_start} &mdash; {item.date_end}<br />
                                                                        <span className="results">{item.results}</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ): ''}
                        </div>
                    </div>
                </div>
            )
        }
    });

    var ProjectList = React.createClass({
        displayName: 'ProjectList',

        render: function () {

            var projects = this.props.projects;
            var main = this.props.main;
            var self = this;

            return (
                <div className="project">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="text-right header">
                                <div className="pull-right text-left">
                                    {main.country == 'Россия' ? 'Регионы Российской Федерации:' : main.country}<br />
                                    <span className="regions-header">
                                        {main.region ? main.region : ''}
                                        {main.city ? (", " + main.city) : ''}
                                    </span>
                                </div>
                                <div className="fa fa-map-marker pull-right icon"></div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="project-list">
                                <div className="main-title">Список проектов:</div>
                                {_.map(projects, function (item, index) {
                                    return (
                                        <div key={index} className="list-item">
                                            <div className="category">
                                                {item.details.category}
                                            </div>
                                            <div className="project-title">
                                                <div className="text-padding">{item.details.title}</div>
                                            </div>
                                            <div className="more-info text-right"><a href="#" onClick={()=>self.props.selected(item)}>Подробнее</a></div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    });

    return React.createClass({
        displayName: "searchForm",
        mixins: [dispatcherHandler(Dispatcher, 'app')],

        getInitialState: function () {
            return {
                data: [],
                selected: false,
                visible: this.props.visible
            };
        },

        componentDidMount: function () {
            detailsStore.on("sync", function (collection) {
                this.setState({
                    data: collection.toJSON()[0]
                });
            }, this);
        },

        setSelected: function (item) {
            this.setState({
                selected: item
            });

            // notify YandexMap component which point was selected
            Dispatcher.dispatch({
                actionType: constants.SELECT_DETAILS
            });
        },

        componentWillReceiveProps: function () {
            if (this.state.selected) {
                this.setState({
                    selected: false
                });
            }
        },

        showSidePanel: function () {
            this.setState({ visible: true });
        },

        hideSidePanel: function () {
            this.setState({
                visible: false,
                selected: false,
                data: []
            });

            Dispatcher.dispatch({
                actionType: constants.RESET_MAP
            });
        },

        appDispatchCallback: function () {
            var self = this;
            return function (payload) {
                switch (payload.actionType) {
                    case constants.POINT_CLICK:
                        self.showSidePanel(payload.data);
                        break;
                }
            }
        },

        backHandler: function () {
            this.setState({
                selected: false
            });
        },

        render: function () {

            let data = this.state.data;

            return (
                <div>
                    {data.results ? (
                        <div className="controls">
                            {!this.state.selected ? (
                                <div className="pull-left back-button cool-button close">
                                    <a onClick={()=>this.hideSidePanel()}>
                                        <i className="fa fa-times" aria-hidden="true"></i>
                                    </a>
                                </div>
                            ) : ''}
                            {this.state.selected ? (
                                <div className="pull-left back-button cool-button info">
                                    <a onClick={()=>this.backHandler()}>
                                        <i className="fa fa-chevron-left" aria-hidden="true"></i>
                                    </a>
                                </div>
                            ) : ''}
                        </div>
                    ) : ''}
                    <div id="sidepanel" className={(this.state.visible ? "visible" : "") + " left " + this.props.type}>

                        {data.results ? (
                            _.size(data.results) == 1 ? (
                                <Project project={data.results[0]} main={data.main} />
                            ) : (
                                this.state.selected ? (
                                    <Project project={this.state.selected} main={data.main} selected={true}/>
                                ) : (
                                    <div>
                                        <ProjectList projects={data.results} main={data.main} selected={this.setSelected} />
                                    </div>
                                )
                            )
                        ) :
                            <table>
                                <tbody>
                                    <tr>
                                        <td colSpan="2">
                                            <Preloader />
                                            <div className="clearfix"></div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        }
                    </div>
                </div>
            )
        },
    });
});
