package report.service;

public interface AiSummaryService {

    /**
     * 주어진 텍스트를 AI를 통해 요약합니다.
     * @param text 요약할 원본 텍스트
     * @return AI가 생성한 요약문
     */
    String summarize(String text);
}