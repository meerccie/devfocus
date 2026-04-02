import {
  Controller,
  Get,
  Param,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GITHUB_REPO_PORT } from '../../application/ports/github-repository.port';
import type { IGithubRepository } from '../../application/ports/github-repository.port';

@Controller('github')
export class GithubController {
  constructor(
    @Inject(GITHUB_REPO_PORT) private readonly githubRepo: IGithubRepository,
  ) {}

  @Get('user/:username')
  async getProfile(@Param('username') username: string) {
    try {
      return await this.githubRepo.getUser(username);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:username/repos')
  async getRepos(@Param('username') username: string) {
    try {
      return await this.githubRepo.getUserRepos(username);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:username/repos/:repo/security')
  async scanRepo(
    @Param('username') owner: string,
    @Param('repo') repo: string,
  ) {
    return await this.githubRepo.scanRepository(owner, repo);
  }
}
