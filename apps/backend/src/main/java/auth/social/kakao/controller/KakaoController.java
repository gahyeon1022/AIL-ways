package auth.social.kakao.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class KakaoController {

    @GetMapping("")
    public String kakaoConnect() {

        StringBuffer url = new StringBuffer();
        url.append("https://kauth.kakao.com/oauth/authorize?");
        url.append("client_id=" + "클라이언트 아이디");
        url.append("&redirect_uri=http://localhost/study/kakao");
        url.append("&response_type=code");

        return "redirect:" + url.toString();
    }

}