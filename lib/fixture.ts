import { createDocument } from './document.js';

export const fixtureJson = {
  subject: 'You are invited to Goldgreen',
  headers: {
    raw: {
      From: 'oyen <hello@example.com>',
      To: 'goldgreen+1@example.com',
      Subject: 'You are invited to Goldgreen',
      'Message-Id': 'ec3a99df5cbe9f8e03dcde5a0b25c8f6',
      'Content-Type':
        'multipart/mixed; boundary="4ef119cb-3969-4a8c-939b-e88bd2680cb9"',
    },
  },
  to: [
    {
      address: 'goldgreen+1@example.com',
      raw: 'goldgreen+1@example.com',
    },
  ],
  from: {
    name: 'oyen',
    address: 'hello@example.com',
    raw: '"oyen" <hello@example.com>',
  },
  attachments: [],
  html: {
    raw: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Invitation link inside<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>\n</div>\n<html dir="ltr" lang="en">\n\n  <head>\n    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />\n    <meta name="x-apple-disable-message-reformatting" />\n    <style>\n      @font-face {\n        font-family: \'Inter\';\n        font-style: normal;\n        font-weight: 100 900;\n        mso-font-alt: \'Arial\';\n        src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format(\'woff2\');\n      }\n\n      * {\n        font-family: \'Inter\', Arial, Helvetica, sans-serif;\n      }\n    </style>\n  </head>\n\n  <body style="font-size:16px;color:#424a53">\n    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em">\n      <tbody>\n        <tr style="width:100%">\n          <td>\n            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">\n              <tbody>\n                <tr>\n                  <td>\n                    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">\n                      <tbody>\n                        <tr>\n                          <td>\n                            <h2 style="font-weight:bolder;letter-spacing:-0.02em">You are invited to Goldgreen</h2>\n                            <p style="font-size:16px;line-height:24px;margin:16px 0">Join the <strong>Goldgreen</strong> team on <strong>oyen</strong></p>\n                            <p style="font-size:16px;line-height:24px;margin:16px 0">You can find out <a href="https://www.example.com/?ref=team-invite&amp;b=oyen">more about oyen</a> on the website.</p><a href="https://console.example.com/users/me/invitations?token=e30.e30.&amp;ref=team-invite&amp;b=oyen#e30.e30." style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background:#0969da;color:#f6f8fa;padding:12px 16px 12px 16px;border-radius:6px;margin:12px 0" target="_blank"><span><!--[if mso]><i style="mso-font-width:400%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Accept Invitation</span><span><!--[if mso]><i style="mso-font-width:400%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span></a>\n                          </td>\n                        </tr>\n                      </tbody>\n                    </table>\n                  </td>\n                </tr>\n              </tbody>\n            </table>\n            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">\n              <tbody>\n                <tr>\n                  <td>\n                    <p style="font-size:14px;line-height:24px;margin:16px 0;color:#6e7781">This email was sent to goldgreen+1@example.com</p>\n                  </td>\n                </tr>\n              </tbody>\n            </table>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </body>\n\n</html>',
    dom: createDocument({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            style:
              'display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0',
          },
          children: [
            {
              type: 'text',
              value: 'Invitation link inside',
            },
            {
              type: 'element',
              tagName: 'div',
              properties: {},
              children: [
                {
                  type: 'text',
                  value:
                    ' ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ',
                },
                {
                  type: 'text',
                  value:
                    '‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌',
                },
                {
                  type: 'text',
                  value:
                    '​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿',
                },
              ],
            },
            {
              type: 'text',
              value: '\n',
            },
            {
              type: 'element',
              tagName: 'html',
              properties: {
                dir: 'ltr',
                lang: 'en',
              },
              children: [
                {
                  type: 'text',
                  value: '\n\n  ',
                },
                {
                  type: 'element',
                  tagName: 'head',
                  properties: {},
                  children: [
                    {
                      type: 'text',
                      value: '\n    ',
                    },
                    {
                      type: 'element',
                      tagName: 'meta',
                      properties: {
                        content: 'text/html; charset=UTF-8',
                        httpEquiv: ['Content-Type'],
                      },
                      children: [],
                    },
                    {
                      type: 'text',
                      value: '\n    ',
                    },
                    {
                      type: 'element',
                      tagName: 'meta',
                      properties: {
                        name: 'x-apple-disable-message-reformatting',
                      },
                      children: [],
                    },
                    {
                      type: 'text',
                      value: '\n    ',
                    },
                    {
                      type: 'element',
                      tagName: 'style',
                      properties: {},
                      children: [
                        {
                          type: 'text',
                          value:
                            "\n      @font-face {\n        font-family: 'Inter';\n        font-style: normal;\n        font-weight: 100 900;\n        mso-font-alt: 'Arial';\n        src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format('woff2');\n      }\n\n      * {\n        font-family: 'Inter', Arial, Helvetica, sans-serif;\n      }\n    ",
                        },
                      ],
                    },
                    {
                      type: 'text',
                      value: '\n  ',
                    },
                    {
                      type: 'text',
                      value: '\n\n  ',
                    },
                    {
                      type: 'element',
                      tagName: 'body',
                      properties: {
                        style: 'font-size:16px;color:#424a53',
                      },
                      children: [
                        {
                          type: 'text',
                          value: '\n    ',
                        },
                        {
                          type: 'element',
                          tagName: 'table',
                          properties: {
                            align: 'center',
                            width: '100%',
                            border: 0,
                            cellPadding: '0',
                            cellSpacing: '0',
                            role: 'presentation',
                            style: 'max-width:37.5em',
                          },
                          children: [
                            {
                              type: 'text',
                              value: '\n      ',
                            },
                            {
                              type: 'element',
                              tagName: 'tbody',
                              properties: {},
                              children: [
                                {
                                  type: 'text',
                                  value: '\n        ',
                                },
                                {
                                  type: 'element',
                                  tagName: 'tr',
                                  properties: {
                                    style: 'width:100%',
                                  },
                                  children: [
                                    {
                                      type: 'text',
                                      value: '\n          ',
                                    },
                                    {
                                      type: 'element',
                                      tagName: 'td',
                                      properties: {},
                                      children: [
                                        {
                                          type: 'text',
                                          value: '\n            ',
                                        },
                                        {
                                          type: 'element',
                                          tagName: 'table',
                                          properties: {
                                            align: 'center',
                                            width: '100%',
                                            border: 0,
                                            cellPadding: '0',
                                            cellSpacing: '0',
                                            role: 'presentation',
                                          },
                                          children: [
                                            {
                                              type: 'text',
                                              value: '\n              ',
                                            },
                                            {
                                              type: 'element',
                                              tagName: 'tbody',
                                              properties: {},
                                              children: [
                                                {
                                                  type: 'text',
                                                  value: '\n                ',
                                                },
                                                {
                                                  type: 'element',
                                                  tagName: 'tr',
                                                  properties: {},
                                                  children: [
                                                    {
                                                      type: 'text',
                                                      value:
                                                        '\n                  ',
                                                    },
                                                    {
                                                      type: 'element',
                                                      tagName: 'td',
                                                      properties: {},
                                                      children: [
                                                        {
                                                          type: 'text',
                                                          value:
                                                            '\n                    ',
                                                        },
                                                        {
                                                          type: 'element',
                                                          tagName: 'table',
                                                          properties: {
                                                            align: 'center',
                                                            width: '100%',
                                                            border: 0,
                                                            cellPadding: '0',
                                                            cellSpacing: '0',
                                                            role: 'presentation',
                                                          },
                                                          children: [
                                                            {
                                                              type: 'text',
                                                              value:
                                                                '\n                      ',
                                                            },
                                                            {
                                                              type: 'element',
                                                              tagName: 'tbody',
                                                              properties: {},
                                                              children: [
                                                                {
                                                                  type: 'text',
                                                                  value:
                                                                    '\n                        ',
                                                                },
                                                                {
                                                                  type: 'element',
                                                                  tagName: 'tr',
                                                                  properties:
                                                                    {},
                                                                  children: [
                                                                    {
                                                                      type: 'text',
                                                                      value:
                                                                        '\n                          ',
                                                                    },
                                                                    {
                                                                      type: 'element',
                                                                      tagName:
                                                                        'td',
                                                                      properties:
                                                                        {},
                                                                      children:
                                                                        [
                                                                          {
                                                                            type: 'text',
                                                                            value:
                                                                              '\n                            ',
                                                                          },
                                                                          {
                                                                            type: 'element',
                                                                            tagName:
                                                                              'h2',
                                                                            properties:
                                                                              {
                                                                                style:
                                                                                  'font-weight:bolder;letter-spacing:-0.02em',
                                                                              },
                                                                            children:
                                                                              [
                                                                                {
                                                                                  type: 'text',
                                                                                  value:
                                                                                    'You are invited to Goldgreen',
                                                                                },
                                                                              ],
                                                                          },
                                                                          {
                                                                            type: 'text',
                                                                            value:
                                                                              '\n                            ',
                                                                          },
                                                                          {
                                                                            type: 'element',
                                                                            tagName:
                                                                              'p',
                                                                            properties:
                                                                              {
                                                                                style:
                                                                                  'font-size:16px;line-height:24px;margin:16px 0',
                                                                              },
                                                                            children:
                                                                              [
                                                                                {
                                                                                  type: 'text',
                                                                                  value:
                                                                                    'Join the ',
                                                                                },
                                                                                {
                                                                                  type: 'element',
                                                                                  tagName:
                                                                                    'strong',
                                                                                  properties:
                                                                                    {},
                                                                                  children:
                                                                                    [
                                                                                      {
                                                                                        type: 'text',
                                                                                        value:
                                                                                          'Goldgreen',
                                                                                      },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                  type: 'text',
                                                                                  value:
                                                                                    ' team on ',
                                                                                },
                                                                                {
                                                                                  type: 'element',
                                                                                  tagName:
                                                                                    'strong',
                                                                                  properties:
                                                                                    {},
                                                                                  children:
                                                                                    [
                                                                                      {
                                                                                        type: 'text',
                                                                                        value:
                                                                                          'oyen',
                                                                                      },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                  type: 'text',
                                                                                  value:
                                                                                    '\n                            ',
                                                                                },
                                                                                {
                                                                                  type: 'element',
                                                                                  tagName:
                                                                                    'p',
                                                                                  properties:
                                                                                    {
                                                                                      style:
                                                                                        'font-size:16px;line-height:24px;margin:16px 0',
                                                                                    },
                                                                                  children:
                                                                                    [
                                                                                      {
                                                                                        type: 'text',
                                                                                        value:
                                                                                          'You can find out ',
                                                                                      },
                                                                                      {
                                                                                        type: 'element',
                                                                                        tagName:
                                                                                          'a',
                                                                                        properties:
                                                                                          {
                                                                                            href: 'https://www.example.com/?ref=team-invite&amp;b=oyen',
                                                                                          },
                                                                                        children:
                                                                                          [
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                'more about oyen',
                                                                                            },
                                                                                          ],
                                                                                      },
                                                                                      {
                                                                                        type: 'text',
                                                                                        value:
                                                                                          ' on the website.',
                                                                                      },
                                                                                      {
                                                                                        type: 'element',
                                                                                        tagName:
                                                                                          'a',
                                                                                        properties:
                                                                                          {
                                                                                            href: 'https://console.example.com/users/me/invitations?ref=team-invite&amp;b=oyen#e30.e30.',
                                                                                            style:
                                                                                              'line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background:#0969da;color:#f6f8fa;padding:12px 16px 12px 16px;border-radius:6px;margin:12px 0',
                                                                                            target:
                                                                                              '_blank',
                                                                                          },
                                                                                        children:
                                                                                          [
                                                                                            {
                                                                                              type: 'element',
                                                                                              tagName:
                                                                                                'span',
                                                                                              properties:
                                                                                                {},
                                                                                              children:
                                                                                                [
                                                                                                  {
                                                                                                    type: 'comment',
                                                                                                    value:
                                                                                                      '[if mso]><i style="mso-font-width:400%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]',
                                                                                                  },
                                                                                                ],
                                                                                            },
                                                                                            {
                                                                                              type: 'element',
                                                                                              tagName:
                                                                                                'span',
                                                                                              properties:
                                                                                                {
                                                                                                  style:
                                                                                                    'max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px',
                                                                                                },
                                                                                              children:
                                                                                                [
                                                                                                  {
                                                                                                    type: 'text',
                                                                                                    value:
                                                                                                      'Accept Invitation',
                                                                                                  },
                                                                                                ],
                                                                                            },
                                                                                            {
                                                                                              type: 'element',
                                                                                              tagName:
                                                                                                'span',
                                                                                              properties:
                                                                                                {},
                                                                                              children:
                                                                                                [
                                                                                                  {
                                                                                                    type: 'comment',
                                                                                                    value:
                                                                                                      '[if mso]><i style="mso-font-width:400%" hidden>&#8202;&#8202;&#8203;</i><![endif]',
                                                                                                  },
                                                                                                ],
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n                          ',
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n                        ',
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n                      ',
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n                    ',
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n                  ',
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n                ',
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n              ',
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n            ',
                                                                                            },
                                                                                            {
                                                                                              type: 'text',
                                                                                              value:
                                                                                                '\n            ',
                                                                                            },
                                                                                            {
                                                                                              type: 'element',
                                                                                              tagName:
                                                                                                'table',
                                                                                              properties:
                                                                                                {
                                                                                                  align:
                                                                                                    'center',
                                                                                                  width:
                                                                                                    '100%',
                                                                                                  border: 0,
                                                                                                  cellPadding:
                                                                                                    '0',
                                                                                                  cellSpacing:
                                                                                                    '0',
                                                                                                  role: 'presentation',
                                                                                                },
                                                                                              children:
                                                                                                [
                                                                                                  {
                                                                                                    type: 'text',
                                                                                                    value:
                                                                                                      '\n              ',
                                                                                                  },
                                                                                                  {
                                                                                                    type: 'element',
                                                                                                    tagName:
                                                                                                      'tbody',
                                                                                                    properties:
                                                                                                      {},
                                                                                                    children:
                                                                                                      [
                                                                                                        {
                                                                                                          type: 'text',
                                                                                                          value:
                                                                                                            '\n                ',
                                                                                                        },
                                                                                                        {
                                                                                                          type: 'element',
                                                                                                          tagName:
                                                                                                            'tr',
                                                                                                          properties:
                                                                                                            {},
                                                                                                          children:
                                                                                                            [
                                                                                                              {
                                                                                                                type: 'text',
                                                                                                                value:
                                                                                                                  '\n                  ',
                                                                                                              },
                                                                                                              {
                                                                                                                type: 'element',
                                                                                                                tagName:
                                                                                                                  'td',
                                                                                                                properties:
                                                                                                                  {},
                                                                                                                children:
                                                                                                                  [
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n                    ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'element',
                                                                                                                      tagName:
                                                                                                                        'p',
                                                                                                                      properties:
                                                                                                                        {
                                                                                                                          style:
                                                                                                                            'font-size:14px;line-height:24px;margin:16px 0;color:#6e7781',
                                                                                                                        },
                                                                                                                      children:
                                                                                                                        [
                                                                                                                          {
                                                                                                                            type: 'text',
                                                                                                                            value:
                                                                                                                              'This email was sent to goldgreen+1@example.com',
                                                                                                                          },
                                                                                                                        ],
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n                  ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n                ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n              ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n            ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n          ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n        ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n      ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n    ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n  ',
                                                                                                                    },
                                                                                                                    {
                                                                                                                      type: 'text',
                                                                                                                      value:
                                                                                                                        '\n\n',
                                                                                                                    },
                                                                                                                  ],
                                                                                                              },
                                                                                                            ],
                                                                                                        },
                                                                                                      ],
                                                                                                  },
                                                                                                ],
                                                                                            },
                                                                                          ],
                                                                                      },
                                                                                    ],
                                                                                },
                                                                              ],
                                                                          },
                                                                        ],
                                                                    },
                                                                  ],
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  },
  text: 'YOU ARE INVITED TO GOLDGREEN\n\nJoin the Goldgreen team on oyen\n\nYou can find out more about oyen\nhttps://www.example.com/?ref=team-invite&b=oyen on the website.\n\nAccept Invitation\nhttps://console.example.com/users/me/invitations?token=e30.e30.&ref=team-invite&b=oyen#e30.e30.\n\nThis email was sent to goldgreen+1@example.com',
};
