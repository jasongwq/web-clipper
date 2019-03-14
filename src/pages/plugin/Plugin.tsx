import * as React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as HyperMD from 'hypermd';
import {
  updateTextClipperData,
  asyncRunPlugin,
} from '../../store/actions/clipper';
import { EditorContainer } from '../../components/container';
import { pluginRouterCreator } from '../../const';

const useActions = {
  asyncRunPlugin: asyncRunPlugin.started,
  updateTextClipperData,
};

const mapStateToProps = ({
  router: {
    location: { pathname },
  },
  clipper,
  userPreference: { liveRendering, showLineNumber, plugins },
}: GlobalStore) => {
  return {
    clipper,
    liveRendering,
    showLineNumber,
    clipperData: clipper.clipperData,
    pathname,
    plugins,
  };
};
type PageState = {};
type PageOwnProps = {};
type PageProps = ReturnType<typeof mapStateToProps> &
  typeof useActions &
PageOwnProps;

const editorId = 'DiamondYuan_Love_LJ';

class ClipperPluginPage extends React.Component<PageProps, PageState> {
  private myCodeMirror: any;

  componentDidUpdate() {
    const { clipperData, pathname } = this.props;
    const data: TextClipperData = (clipperData[
      pathname
    ] as TextClipperData) || { type: 'text', data: '' };
    if (this.myCodeMirror) {
      const value = this.myCodeMirror.getValue();
      if (data.data !== value) {
        this.myCodeMirror.setValue(data.data);
      }
    }
  }

  componentDidMount = () => {
    const { clipperData, pathname, plugins } = this.props;
    let myTextarea = document.getElementById(editorId) as HTMLTextAreaElement;
    this.myCodeMirror = HyperMD.fromTextArea(myTextarea, {
      lineNumbers: !!this.props.showLineNumber,
      hmdModeLoader: false,
    });

    const plugin = plugins.find(
      o => pluginRouterCreator(o.id) === pathname
    ) as ClipperPlugin;

    if (!clipperData[pathname]) {
      this.props.asyncRunPlugin({
        pathname,
        plugin,
      });
    }
    const data: TextClipperData = (clipperData[
      pathname
    ] as TextClipperData) || { type: 'text', data: '' };
    this.myCodeMirror.setValue(data.data);
    this.myCodeMirror.on('change', (editor: any) => {
      this.props.updateTextClipperData({
        path: pathname,
        data: {
          type: 'text',
          data: editor.getValue(),
        },
      });
    });
    this.myCodeMirror.setSize(800, 621);
    if (this.props.liveRendering) {
      HyperMD.switchToHyperMD(this.myCodeMirror);
    } else {
      HyperMD.switchToNormal(this.myCodeMirror);
    }
  };

  render() {
    return (
      <EditorContainer>
        <textarea id={editorId} />
      </EditorContainer>
    );
  }
}

export default connect(
  mapStateToProps,
  (dispatch: Dispatch) =>
    bindActionCreators<typeof useActions, typeof useActions>(
      useActions,
      dispatch
    )
)(ClipperPluginPage as React.ComponentType<PageProps>);
