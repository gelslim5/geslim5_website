window.PAPER_DATA = {
  "abstract": [
    "Vision and touch provide complementary cues for object pose and local contact geometry, but external cameras are often occluded at the contact site. We present GelSlim 5.0, a fingertip sensor that acquires visual and tactile observations with one fixed camera and a continuous UV-responsive contact layer. By switching illumination, the camera sequentially acquires through-membrane visual images and contact-sensitive tactile images from a shared viewpoint, avoiding inter-camera extrinsic calibration.",
    "To combine these observations, we introduce VisTacFusion, a multimodal transformer with separate prediction paths for planar object pose and contact geometry. Asymmetric bottleneck fusion incorporates visual context while preserving tactile spatial features for depth and surface-normal estimation. Modality dropout enables inference with paired inputs or either modality alone.",
    "On real validation data from 12 known objects, paired inputs reduce depth MSE, angular error, and translation L₁ by 61.2%, 72.3%, and 61.3%, respectively, relative to tactile-only inference with the same model. Relative to visual-only inference, the corresponding reductions are 93.7%, 6.1%, and 8.6%."
  ],
  "tables": {
    "visual": [
      {
        "name": "MAE",
        "shared": false,
        "ours": false,
        "values": [
          0.0756,
          0.0403,
          0.0135,
          0.678,
          0.006
        ]
      },
      {
        "name": "DINOv3",
        "shared": false,
        "ours": false,
        "values": [
          0.0968,
          0.0358,
          0.0256,
          1.26,
          0.011
        ]
      },
      {
        "name": "CLIP",
        "shared": false,
        "ours": false,
        "values": [
          0.1501,
          0.038,
          0.0554,
          2.554,
          0.0294
        ]
      },
      {
        "name": "SigLIP",
        "shared": false,
        "ours": false,
        "values": [
          0.1449,
          0.0392,
          0.0525,
          2.526,
          0.0277
        ]
      },
      {
        "name": "T3",
        "shared": false,
        "ours": false,
        "values": [
          0.0505,
          0.025,
          0.0135,
          0.671,
          0.0059
        ]
      },
      {
        "name": "DAv2",
        "shared": false,
        "ours": false,
        "values": [
          0.0678,
          0.0275,
          0.0141,
          0.701,
          0.006
        ]
      },
      {
        "name": "TVL + MAE",
        "shared": true,
        "ours": false,
        "values": [
          0.0523,
          0.0322,
          0.0156,
          0.772,
          0.006
        ]
      },
      {
        "name": "Sparsh-X+MAE",
        "shared": true,
        "ours": false,
        "values": [
          0.0561,
          0.029,
          0.0145,
          0.723,
          0.0059
        ]
      },
      {
        "name": "VisTacFusion",
        "shared": true,
        "ours": true,
        "values": [
          0.1055,
          0.0388,
          0.0138,
          0.694,
          0.0058
        ]
      }
    ],
    "tactile": [
      {
        "name": "DAv2",
        "shared": false,
        "ours": false,
        "values": [
          0.0167,
          0.0128,
          0.0474,
          2.279,
          0.0116
        ]
      },
      {
        "name": "Sparsh-X",
        "shared": false,
        "ours": false,
        "values": [
          0.0183,
          0.0138,
          0.0474,
          2.268,
          0.0119
        ]
      },
      {
        "name": "DINOv3",
        "shared": false,
        "ours": false,
        "values": [
          0.0174,
          0.0136,
          0.0663,
          3.185,
          0.0162
        ]
      },
      {
        "name": "T3",
        "shared": false,
        "ours": false,
        "values": [
          0.0177,
          0.0133,
          0.205,
          9.929,
          0.046
        ]
      },
      {
        "name": "SITR",
        "shared": false,
        "ours": false,
        "values": [
          0.0156,
          0.0118,
          0.0748,
          3.626,
          0.0214
        ]
      },
      {
        "name": "TVL",
        "shared": false,
        "ours": false,
        "values": [
          0.021,
          0.0163,
          0.1057,
          5.084,
          0.0247
        ]
      },
      {
        "name": "Sparsh-DINOv2",
        "shared": false,
        "ours": false,
        "values": [
          0.0189,
          0.0139,
          0.1227,
          5.914,
          0.0268
        ]
      },
      {
        "name": "Sparsh-MAE",
        "shared": false,
        "ours": false,
        "values": [
          0.0172,
          0.013,
          0.1255,
          6.03,
          0.0281
        ]
      },
      {
        "name": "TVL + MAE",
        "shared": true,
        "ours": false,
        "values": [
          0.0231,
          0.016,
          0.0804,
          3.903,
          0.0216
        ]
      },
      {
        "name": "Sparsh-X+MAE",
        "shared": true,
        "ours": false,
        "values": [
          0.0199,
          0.0145,
          0.0503,
          2.411,
          0.014
        ]
      },
      {
        "name": "VisTacFusion",
        "shared": true,
        "ours": true,
        "values": [
          0.017,
          0.0128,
          0.0488,
          2.35,
          0.0137
        ]
      }
    ],
    "both": [
      {
        "name": "VITaL (adapted)",
        "shared": false,
        "ours": false,
        "values": [
          0.0254,
          0.0182,
          0.0423,
          2.034,
          0.0112
        ]
      },
      {
        "name": "MViTac (adapted)",
        "shared": false,
        "ours": false,
        "values": [
          null,
          null,
          0.0215,
          1.027,
          0.0072
        ]
      },
      {
        "name": "TVL + MAE",
        "shared": true,
        "ours": false,
        "values": [
          0.0106,
          0.0103,
          0.0143,
          0.72,
          0.0058
        ]
      },
      {
        "name": "Sparsh-X+MAE",
        "shared": true,
        "ours": false,
        "values": [
          0.0107,
          0.0101,
          0.0131,
          0.655,
          0.0055
        ]
      },
      {
        "name": "VisTacFusion",
        "shared": true,
        "ours": true,
        "values": [
          0.0066,
          0.0074,
          0.0129,
          0.652,
          0.0053
        ]
      }
    ]
  }
};
