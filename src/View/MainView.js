import React from 'react';
import './css/MainView.scss';
import { InputItem } from './components';
import AppData from '../Model/AppData';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { DrawingPanel } from './components/DrawingPanel';
import { Icon } from './components';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
@observer
class MainView extends React.Component {
  constructor(props) {
    super(props);
    this.inputRefs = [];
    this.state = {
      focusIndex: 0,
      drawingData: { points: [], segments: [] }
    };
  }

  @autobind
  onValueChange(value: string, index: number) {
    AppData.RelationsInput[index].value = value;
  }

  @autobind
  onSubmit(index: number) {
    if (index === AppData.RelationsInput.length - 1 && AppData.RelationsInput[index].value.length > 2) {
      AppData.addNewInput();
    }

    this.setState({ focusIndex: index + 1 });
  }

  @autobind
  onBackspace(index: number) {
    const value = AppData.RelationsInput[index].value;
    if (index === AppData.RelationsInput.length - 1 && index > 0 && value.length === 0) {
      AppData.removeInput();
      this.inputRefs.pop();
      this.setState({ focusIndex: index - 1 });
    }
  }

  @autobind
  onClickDrawing() {}

  componentDidUpdate() {
    const { focusIndex } = this.state;
    if (this.inputRefs[focusIndex]) {
      this.inputRefs[focusIndex].focus();
    }
  }

  @autobind
  renderRelationInput(): React.Node {
    return AppData.RelationsInput.map((model, index) => (
      <InputItem
        key={`input-${index}`}
        ref={(ref) => {
          this.inputRefs[index] = ref;
        }}
        onValueChange={(value: string) => {
          this.onValueChange(value, index);
        }}
        onSubmit={() => {
          this.onSubmit(index);
        }}
        onBackspace={() => {
          this.onBackspace(index);
        }}
        value={model.value}
        status={model.status}
      />
    ));
  }

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
                <div
                  className="card-header left-panel-tab"
                  id="headingOne"
                  data-toggle="collapse"
                  data-target="#viewOne"
                  aria-expanded="true"
                  aria-controls="collapseOne">
                  <p>1. Nhập đề</p>
                  <OverlayTrigger
                    key="right"
                    placement="right"
                    overlay={
                      <Tooltip id={`tooltip-right`}>
                        <Icon name="icInformation" width={25} height={25} />
                      </Tooltip>
                    }>
                    <Button className="bg-transparent icon-container">
                      <Icon name="icInformation" width={25} height={25} />
                    </Button>
                  </OverlayTrigger>
                </div>

                <div
                  id="viewOne"
                  className="collapse show"
                  aria-labelledby="headingOne"
                  data-parent="#accordionExample">
                  <div className="card-body">
                    {this.renderRelationInput()}
                    <Button type="button" className="btn btn-success w-100" onClick={this.onClickDrawing}>
                      Vẽ hình
                    </Button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header" id="headingTwo">
                  <button
                    className="btn btn-primary"
                    type="button"
                    data-toggle="collapse"
                    data-target="#viewTwo"
                    aria-expanded="true"
                    aria-controls="collapseOne">
                    Controller 2
                  </button>
                </div>

                <div id="viewTwo" className="collapse " aria-labelledby="headingOne" data-parent="#accordionExample">
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
                  <button
                    className="btn btn-primary"
                    type="button"
                    data-toggle="collapse"
                    data-target="#viewThree"
                    aria-expanded="true"
                    aria-controls="collapseOne">
                    Controller 3
                  </button>
                </div>

                <div id="viewThree" className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
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
            <DrawingPanel drawingData={this.state.drawingData} />
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
