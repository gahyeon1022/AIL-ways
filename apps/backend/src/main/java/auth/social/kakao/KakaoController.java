package auth.social.kakao;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RequiredArgsConstructor
@RequestMapping("")
public class KakaoController {
    @GetMapping("/auth/login/kakao")
    public BaseResponse<UserResponseDTO.JoinResultDTO> kakaoLogin(@RequestParam("code") String accessCode, HttpServletResponse httpServletResponse) {
        User user = authService.oAuthLogin(accessCode, httpServletResponse);
        return BaseResponse.onSuccess(UserConverter.toJoinResultDTO(user));
    }
}
