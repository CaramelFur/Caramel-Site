---
title: "Hacking a Sony AVR"
subtitle: "Force Enabling Network Standby"
date: 2024-08-15
---

### The Problem

I recently bought a Sony STR-DN860 AV receiver for my TV, everything was working fine after I installed it. But one thing I quickly noticed was that while the receiver was in standby, it would not allow you cast any music to it.  With my other reciever, an Onkyo TR-NR626, this was easily possible by enabling the network standby feature. I was hoping this would be the same for the Sony receiver, but after digging through the settings I couldn't find anything related to network standby.

### Online Documentation

So like anyone else I went online looking for a solution, maybe I had just missed a setting somewhere? But after landing on the official Sony support page, I was suprised to find the reason why I couldn't find the setting. For some reason, Sony had decided to not include the network standby feature for all European models of the STR-DN860. So the US, Canada, and other regions would have the feature, but not Europe.

### Identifying the difference

Initially I assumed there was some mayor hardware difference between the regions, so I decided to download the latest firmware updates for both the European model and the US model. Maybe I could find some differences in the firmware that would explain why the feature was missing. But after comparing the firmware files, I found they were identical. So this must mean it's a very small software check somewhere in the firmware that decides if the feature is enabled or not. And since both models were running the same firmware, they were most likely running the same software.

### Reverse Engineering the Settings

Now that I know its just a software restriction somewhere, I wanted to see if it would be possible to bypass the check. I first started to dig into the firmware file, but quickly realized this was in a format that was either encrypted, or stored in such a way that I with my current knowledge couldn't open it.

After this I decided to see what network ports it has open while it is on, maybe I could change the setting somewhere in there. I quickly found that there was a full settings configuration website page available on the default port 80. It looks like the following:

![Screenshot](https://i.caramelfur.dev/i/dd70d529-6749-4ac2-b0ed-d4b50ee286fa.webp "A screenshot of the AV Receiver settings page")

Of course I first tried to find the setting there, but sadly it wasn't there either. So then I took a look at the requests that this settings page was sending to actually change the settings of the receiver. And after a quick look at the developer console, I could see that it was sending POST requests to the `/cgi-bin/request.fcgi` endpoint. Depending on the request, it would either return the current settings, or change the settings. Following is a request for all `system` settings:

```json
{
  "type": "http_get",
  "packet": [
    { "id": 52, "feature": "system.language" },
    { "id": 53, "feature": "system.autodisplay" },
    { "id": 54, "feature": "system.quickstart" },
    { "id": 55, "feature": "system.autoStandby" },
    { "id": 56, "feature": "system.dimmer" },
    { "id": 57, "feature": "system.updatenotify" },
    { "id": 58, "feature": "system.autoupdate" },
    { "id": 59, "feature": "system.timezone" },
    { "id": 60, "feature": "network.devicename" },
    { "id": 61, "feature": "system.sircsmode" }
  ]
}
```

To which the receiver would respond with:

```json
{
  "type": "http_get_result",
  "event_available": [159, 250, 205, 0, 53, 31, 3, 28, 128, 161, 208],
  "packet": [
    { "id": 52, "feature": "system.language", "value": "english" },
    { "id": 53, "feature": "system.autodisplay", "value": "on" },
    { "id": 54, "feature": "system.quickstart", "value": "on" },
    { "id": 55, "feature": "system.autoStandby", "value": "off" },
    { "id": 56, "feature": "system.dimmer", "value": "0" },
    { "id": 57, "feature": "system.updatenotify", "value": "on" },
    { "id": 58, "feature": "system.autoupdate", "value": "on" },
    { "id": 59, "feature": "system.timezone", "value": "Europe/Amsterdam|60" },
    { "id": 60, "feature": "network.devicename", "value": "WideSound" },
    { "id": 61, "feature": "system.sircsmode", "value": "av2" }
  ]
}
```

And if I for example disable software update notifications, it would produce the following request:

```json
{
  "type": "http_set",
  "packet": [
    { "id": 62, "feature": "system.updatenotify", "value": "off" }
  ]
}
```

And this would in turn produce the following response:

```json
{
  "type": "http_set_result",
  "event_available": [159, 250, 205, 0, 53, 31, 3, 28, 128, 161, 208],
  "packet": [
    { "id": 62, "value": "ACK" }
  ]
}
```

### Exploiting the Settings

Now that I know how the settings are being changed, I wanted to see if I could change the network standby setting. Even if it was not in the UI, it might still be there.
I had no clue what this setting was called internally though, so first I guessed `system.network_standby` and tried to change it to `on` with the following request:

```json
{
  "type": "http_set",
  "packet": [
    { "id": 63, "feature": "system.network_standby", "value": "on" }
  ]
}
```

Sadly this caused an error response, so that was not a setting that existed. Since I saw a setting called `network.devicename`, my next guess was `network.standby`. I then sent the following request:

```json
{
  "type": "http_set",
  "packet": [
    { "id": 64, "feature": "network.standby", "value": "on" }
  ]
}
```

And holy shit, the receiver responded with an `ACK` response. At first I thought this was maybe just a dud, because it can't be that easy right? But after putting the receiver in standby and trying to cast music to it, it worked! The network standby feature was now enabled on my European model Sony STR-DN860.

### Conclusion

I'm not sure why Sony decided to disable this feature for European models, but I'm glad I was able to bypass it. I'm also glad that it was just a simple software check, and not a mayor hardware difference.

So if you ever end up in a similar situation, remember that too many things only do client side checks. These are easily bypassed by just changing the request that is being sent. So always check the requests that are being sent, and see if you can change them to your advantage.

### Source

If you just want to enable the network standby feature on your Sony AVR, you can find a simple NodeJS script that enables it in this [GitHub repository](https://github.com/caramelfur/Sony-AV-Network-Standby-Enabler). Just run the script with the IP of your receiver, and it will enable the network standby feature for you.
