import React from 'react';
import './css/MainView.scss';

class MainView extends React.Component {
  render() {
    return (
      <div className={'container-fluid'}>
        <div className={'app-header'}>
          <div className={'app-name'}>
            <p>Gemath</p>
          </div>

          <div className={'app-description'}>
            <p>app description</p>
          </div>
        </div>

        <div className={'app-body'}>
          <div className={'app-controller'}>
            <div className="accordion" id="accordionExample">
              <div className="card">
                <div className="card-header" id="headingOne">
                  <button className="btn btn-primary"
                          type="button"
                          data-toggle="collapse"
                          data-target="#viewOne"
                          aria-expanded="true"
                          aria-controls="collapseOne">
                    Controller 1
                  </button>
                </div>

                <div id="viewOne"
                     className="collapse show"
                     aria-labelledby="headingOne"
                     data-parent="#accordionExample">
                  <div className="card-body">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3
                    wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum
                    eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
                    assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt
                    sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer
                    farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus
                    labore sustainable VHS.
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header" id="headingTwo">
                  <button className="btn btn-primary"
                          type="button"
                          data-toggle="collapse"
                          data-target="#viewTwo"
                          aria-expanded="true"
                          aria-controls="collapseOne">
                    Controller 2
                  </button>
                </div>

                <div id="viewTwo"
                     className="collapse "
                     aria-labelledby="headingOne"
                     data-parent="#accordionExample">
                  <div className="card-body">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3
                    wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum
                    eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
                    assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt
                    sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer
                    farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus
                    labore sustainable VHS.
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header" id="headingThree">
                  <button className="btn btn-primary"
                          type="button"
                          data-toggle="collapse"
                          data-target="#viewThree"
                          aria-expanded="true"
                          aria-controls="collapseOne">
                    Controller 3
                  </button>
                </div>

                <div id="viewThree"
                     className="collapse"
                     aria-labelledby="headingOne"
                     data-parent="#accordionExample">
                  <div className="card-body">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3
                    wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum
                    eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
                    assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt
                    sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer
                    farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus
                    labore sustainable VHS.
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className={'app-drawing-panel'}>
          </div>
        </div>

        <div className={'app-footer'}>
          <p>abc</p>
        </div>
      </div>
    );
  }
}

export default MainView;